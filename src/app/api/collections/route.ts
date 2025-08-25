import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicOnly = searchParams.get('publicOnly') === 'true';
    
    // 获取用户会话
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    let collections;
    
    // 如果是公开集合查询
    if (publicOnly) {
      collections = await prisma.collection.findMany({
        where: {
          isPublic: true
        },
        orderBy: {
          sortOrder: "asc"
        }
      });
    }
    // 如果用户已登录，返回用户可访问的集合（包括公开的和私人的）
    else if (userId) {
      collections = await prisma.collection.findMany({
        where: {
          OR: [
            { isPublic: true },
            { userCollections: { some: { userId } } }
          ]
        },
        orderBy: {
          sortOrder: "asc"
        }
      });
    }
    // 如果用户未登录，只返回公开集合
    else {
      collections = await prisma.collection.findMany({
        where: {
          isPublic: true
        },
        orderBy: {
          sortOrder: "asc"
        }
      });
    }

    // Return data structure:
    // An array of collection objects with the following properties:
    // {
    //   id: string,           // Unique identifier of the collection
    //   name: string,         // Name of the collection
    //   description?: string, // Optional description of the collection
    //   icon?: string,        // Optional icon for the collection
    //   isPublic: boolean,    // Indicates if the collection is publicly visible
    //   viewStyle: string,    // Display style of the collection
    //   sortStyle: string,    // Sorting method for items in the collection
    //   sortOrder: number,    // Numerical order for sorting collections
    //   slug: string,         // URL-friendly name of the collection
    //   totalBookmarks: number // Total number of bookmarks in the collection
    // }
    const collectionsWithBookmarkCount = await Promise.all(
      collections.map(async (collection) => {
        const folders = await prisma.folder.findMany({
          where: {
            collectionId: collection.id
          },
          select: {
            id: true
          }
        });

        const folderIds = folders.map(folder => folder.id);

        const totalBookmarks = await prisma.bookmark.count({
          where: {
            collectionId: collection.id,
            OR: [
              { folderId: null },
              { folderId: { in: folderIds } }
            ]
          }
        });

        return {
          ...collection,
          totalBookmarks
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: collectionsWithBookmarkCount
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to get bookmark collections" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "需要登录才能创建集合" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, icon, isPublic, viewStyle, sortStyle, sortOrder } = body;
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: "集合名称不能为空" },
        { status: 400 }
      );
    }
    
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');

    // 检查名称是否已存在
    const existingCollection = await prisma.collection.findFirst({
      where: {
        OR: [
          { name },
          { slug }
        ]
      }
    });

    if (existingCollection) {
      return NextResponse.json(
        { success: false, error: "集合名称已存在，请使用其他名称" },
        { status: 400 }
      );
    }

    // 创建新集合
    const collection = await prisma.collection.create({
      data: {
        name: name.trim(),
        description: description?.trim() || "",
        icon: icon || "",
        isPublic: isPublic ?? true,
        viewStyle: viewStyle || "list",
        sortStyle: sortStyle || "alpha",
        sortOrder: sortOrder ?? 0,
        slug,
      },
    });

    // 创建用户与集合的关联关系
    await prisma.userCollection.create({
      data: {
        userId: session.user.id,
        collectionId: collection.id,
        isOwner: true,
        canEdit: true
      }
    });

    return NextResponse.json({
      success: true,
      data: collection
    });
  } catch (error: unknown) {
    console.error("创建集合错误:", error);
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: "名称或标识符已被使用" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: `创建集合失败: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    );
  }
}
