import { useState, useRef, useEffect } from "react";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

interface AISearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  onSuggestionClick?: (suggestion: string) => void;
}

interface SearchSuggestion {
  title: string;
}

interface PopularSearch {
  query: string;
  count: number;
}

export function AISearchBar({ 
  placeholder = "Ask anything...", 
  onSearch,
  onSuggestionClick
}: AISearchBarProps) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { settings, loading } = useSettings('feature');

  // 如果正在加载或搜索功能被禁用，直接返回 null
  if (loading || settings?.enableSearch === 'false' || !settings?.enableSearch) {
    return null;
  }

  // 获取搜索建议
  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/ai-search?type=suggest&q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
    }
  };

  // 获取热门搜索
  const fetchPopularSearches = async () => {
    try {
      const response = await fetch(`/api/ai-search?type=popular&limit=5`);
      const data = await response.json();
      setPopularSearches(data.popularSearches || []);
    } catch (error) {
      console.error("Failed to fetch popular searches:", error);
      setPopularSearches([]);
    }
  };

  // 处理搜索
  const handleSearch = async () => {
    if (!inputValue.trim()) {
      return;
    }
    
    setIsSearching(true);
    try {
      onSearch?.(inputValue.trim());
    } finally {
      setIsSearching(false);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const value = e.currentTarget.textContent || '';
    setInputValue(value);
    
    // 获取搜索建议
    if (value.trim()) {
      fetchSuggestions(value);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      // 确保 div 的内容与 inputValue 同步
      if (editorRef.current.textContent !== inputValue) {
        editorRef.current.textContent = inputValue;
      }
    }
  }, [inputValue]);

  useEffect(() => {
    // 获取热门搜索
    fetchPopularSearches();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onSuggestionClick?.(suggestion);
    setShowSuggestions(false);
    editorRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-[600px]">
      <div className="relative w-full flex flex-col">
        <div className="relative flex-1">
          <Sparkles 
            className={`
              absolute left-3 top-4 h-4 w-4 text-muted-foreground
              transition-all duration-300 ease-in-out
              ${inputValue || isFocused 
                ? 'opacity-0 -translate-x-4' 
                : 'opacity-100 translate-x-0'
              }
            `} 
          />
          
          <div className="relative">
            <div
              ref={editorRef}
              contentEditable
              className={`
                outline-none border rounded-xl w-full text-sm
                ${!inputValue && !isFocused ? 'pl-10' : 'pl-4'} 
                pr-12 
                ${isFocused || inputValue ? 'pb-12' : 'pb-3'}
                pt-3
                focus:ring-1 focus:ring-black/5
                hide-scrollbar
                transition-all duration-200 ease-in-out
              `}
              style={{
                whiteSpace: 'pre-wrap',
                overflowY: 'auto',
                overflowX: 'hidden',
                wordBreak: 'break-word',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
                height: isFocused || inputValue ? '8rem' : '3rem',
                minHeight: isFocused || inputValue ? '8rem' : '3rem',
                maxHeight: isFocused || inputValue ? '12rem' : '3rem'
              }}
              onFocus={() => {
                setIsFocused(true);
                if (inputValue.trim()) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                // 延迟隐藏建议，以便点击建议时不会立即隐藏
                setTimeout(() => {
                  setIsFocused(false);
                  setShowSuggestions(false);
                }, 200);
              }}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              role="textbox"
              aria-multiline="true"
              aria-label={placeholder}
            />

            {(isFocused || inputValue) && (
              <div 
                className={`
                  absolute bottom-[12px] left-4 flex items-center gap-4 py-1 w-[calc(100%-3rem)]
                  transition-all duration-300 ease-in-out
                  ${isFocused || inputValue
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4 pointer-events-none'
                  }
                `}
                style={{
                  background: 'linear-gradient(to bottom, transparent, white 15%, white)',
                  pointerEvents: 'auto',
                  zIndex: 10,
                  paddingBottom: '0.75rem',
                  marginBottom: '-0.75rem',
                  height: '3rem',
                  clipPath: 'inset(0 0 1px 0)',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">AI Search</span>
                </div>
              </div>
            )}

            <div 
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: isFocused || inputValue
                  ? `translateY(20px)`
                  : 'translateY(-50%)',
                zIndex: 20
              }}
            >
              <div 
                className="bg-black rounded-full p-1.5 cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={handleSearch}
              >
                {isSearching ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <ArrowRight className="h-4 w-4 text-white" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 搜索建议和热门搜索 */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
            {suggestions.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-medium text-gray-500">Suggestions</div>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                    onClick={() => handleSuggestionClick(suggestion.title)}
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                    {suggestion.title}
                  </div>
                ))}
              </div>
            )}
            
            {popularSearches.length > 0 && suggestions.length === 0 && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-medium text-gray-500">Popular Searches</div>
                {popularSearches.map((search, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                    onClick={() => handleSuggestionClick(search.query)}
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-gray-400" />
                      {search.query}
                    </span>
                    <span className="text-xs text-gray-400">{search.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}