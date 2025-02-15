import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { News } from "@/types/news";
import NewService from "@/services/NewsService";
import { Checkbox } from 'semantic-ui-react';
import DOMPurify from "dompurify";
import 'react-quill/dist/quill.snow.css';

const NewsList = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalEntries, setTotalEntries] = useState(0);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isConfirmAction, setConfirmAction] = useState(false);
  const [selectedNewsIds, setSelectedNewsId] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [baseStatus, setBaseStatus] = useState(true);

  const navigate = useNavigate();

  const createSafeHTML = (html: string) => {
    const sanitized = DOMPurify.sanitize(html);
    return { __html: sanitized };
  };

  const fetchNews = async () => {
    try {
      const query = {
        pageIndex: pageIndex,
        pageSize: pageSize,
        searchTerm: searchTerm,
        status: baseStatus
      }
      const data = await NewService.GetNewsList(query);
      setNews(data.newsList);
      setTotalEntries(data.totalNews);
    } catch (err) {
      setError("Failed to load news data");
      setLoading(false);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    console.log(baseStatus);
  }, [pageIndex, pageSize, searchTerm, baseStatus]);

  const handlePageChange = async (newPage: number) => {
    setPageIndex(newPage);
  };

  const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPageIndex(1);
  };

  const handleSelectAll = () => {
    if (!isSelectAll) {
      setSelectedNewsId(news.map((n) => n.id));
    } else {
      setSelectedNewsId([]);
    }
    setIsSelectAll(!isSelectAll);
  };

  const handleCheckboxChange = (id: string) => {
    if (selectedNewsIds.includes(id)) {
      setSelectedNewsId(selectedNewsIds.filter((newId) => newId !== id));
    } else {
      setSelectedNewsId([...selectedNewsIds, id]);
    }
  };

  const handleConfirmAction = async () => {
    try {
      await NewService.ChangeNewsStatus(selectedNewsIds);
      setSelectedNewsId([]);
      await fetchNews();
    } catch (e) {
      console.error(e);
    }
    handleClose();
  };

  // const handleToggleStatus = () => {
  //   if (selectedNewsIds.length === 0) {
  //     setPopupMessage("Please select news to take action");
  //     setPopupVisible(true);
  //     return;
  //   }
  //   setPopupMessage(
  //     "Are you sure you want to make inactive/active the selected news?"
  //   );
  //   setPopupVisible(true);
  //   setConfirmAction(true);
  // };

  const handleUpdateNews = () => {
    if (selectedNewsIds.length > 1 || selectedNewsIds.length === 0) {
      setPopupMessage("Please select only one news item to update");
      setPopupVisible(true);
      return;
    }
    navigate(`/news/update/${selectedNewsIds[0]}`, { state: { news: selectedNewsIds[0] } });
  };

  const handleClose = () => {
    setPopupVisible(false);
    setConfirmAction(false);
  };

  const handleLoadStatusChange = async () => {
    setBaseStatus(!baseStatus);
    setPageIndex(1);
  }

  const totalPages = Math.ceil(totalEntries / pageSize);
  const startIndex = (pageIndex - 1) * pageSize;
  const displayCount = Math.min(pageSize, totalEntries - startIndex);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      // If total pages is 7 or less, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always add page 1
      pages.push(1);

      let startPage: number;
      let endPage: number;

      if (pageIndex <= 4) {
        // Near the start
        startPage = 2;
        endPage = 5;
        pages.push(...Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i));
      }
      else if (pageIndex >= totalPages - 3) {
        // Near the end
        startPage = totalPages - 4;
        endPage = totalPages - 1;
        pages.push(...Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i));
      }
      else {
        // Middle - show current page, 2 before and 2 after
        startPage = pageIndex - 2;
        endPage = pageIndex + 2;
        pages.push(...Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i));
      }
      // Always add last page
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="p-4">
      <h1 className="text-center text-2xl font-bold mb-4">NEWS LIST</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between mb-2">
          <div>
            <label htmlFor="entries" className="mr-2">
              Show
            </label>
            <select
              name="entries"
              className="border rounded p-1"
              onChange={(e) => {
                setPageSize(parseInt(e.target.value));
                setSelectedNewsId([]);
              }}
              value={pageSize}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
            <span className="ml-2">entries</span>
          </div>

          <div className="ml-auto flex items-center mr-6">
            <label className="mr-2">{baseStatus ? "Active" : "Inactive"}</label>
            <Checkbox toggle onClick={handleLoadStatusChange} checked={baseStatus} />
          </div>
          <input
            type="text"
            placeholder="Search by ID..."
            className="border p-1 rounded"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <table className="min-w-full border-collapse table-auto">
          <thead>
            <tr className="bg-green-600 text-white">
              <th className="border p-2 text-left">
                <input
                  type="checkbox"
                  checked={selectedNewsIds.length === news.length && news.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="border p-2 text-left">News ID</th>
              <th className="border p-2 text-left">Title</th>
              <th className="border p-2 text-left">Preview</th>
              <th className="border p-2 text-left">PostDate</th>
              <th className="border p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {news.map((newsItem: News) => (
              <tr key={newsItem.id} className="odd:bg-gray-100 even:bg-white">
                <td className="border p-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={selectedNewsIds.includes(newsItem.id)}
                    onChange={() => handleCheckboxChange(newsItem.id)}
                  />
                </td>
                <td className="border p-2">
                  <button className="text-blue-600"
                    onClick={() => navigate(`/news/update/${newsItem.id}`)}
                  >{newsItem.id}</button></td>
                <td className="border p-2">{newsItem.title}</td>
                <td
                  className="text-justify text-lg text-gray-700 ql-editor"
                  dangerouslySetInnerHTML={createSafeHTML(newsItem.preview)}>
                </td>
                <td className="border p-2">
                  {new Date(newsItem.postDate).toLocaleDateString("en-GB")}
                </td>
                <td style={{ color: newsItem.status ? "green" : "red" }}
                  className="border p-2 font-bold">
                  {newsItem.status ? "Active" : "Inactive"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-4">
          <div>
            Showing {startIndex + 1} to {startIndex + displayCount} of {totalEntries} entries
          </div>
          <div className="mt-4 flex justify-end">
            <nav>
              <ul className="inline-flex items-center -space-x-px">
                <li>
                  <button
                    onClick={() => handlePageChange(pageIndex - 1)}
                    disabled={pageIndex === 1}
                    className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700"
                  >
                    «
                  </button>
                </li>
                {getPageNumbers().map((page, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 leading-tight border ${pageIndex === page
                        ? 'bg-gray-500 text-white'
                        : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-100 hover:text-gray-700'
                        }`}
                    >
                      {page}
                    </button>
                  </li>
                ))}

                <li>
                  <button
                    onClick={() => handlePageChange(pageIndex + 1)}
                    disabled={pageIndex === totalPages}
                    className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700"
                  >
                    »
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="flex items-center mt-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
            onClick={() => navigate("/news/create")}
          >
            Create News
          </button>
          <button
            className="px-4 py-2 bg-orange-500 text-white rounded mr-2"
            onClick={handleUpdateNews}
          >
            Update News
          </button>
          {/* <button
            className="px-4 py-2 bg-red-500 text-white rounded mr-2"
            onClick={handleToggleStatus}
          >
            Make Active/Inactive
          </button> */}
        </div>
      </div>

      {isPopupVisible && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p>{popupMessage}</p>
            <div className="mt-4 text-center">
              {isConfirmAction ? (
                <>
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded mr-2"
                    onClick={handleConfirmAction}
                  >
                    Yes
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded"
                    onClick={handleClose}
                  >
                    No
                  </button>
                </>
              ) : (
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                  onClick={handleClose}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsList;
