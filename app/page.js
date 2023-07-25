'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function Home() {

  const [bookName, setBookName] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookData, setBookData] = useState(null);
  const [suggestedBooks, setSuggestedBooks] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedBookThumbnail, setSelectedBookThumbnail] = useState(null);

  const [otherBooks, setOtherBooks] = useState([]);


  const debounce = (fn, delay) => {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    };
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${bookName}&key=AIzaSyAxxpq_0aweUInshI1dAccLaJRMa77s7kI`,
          {
            headers: {
              accept: 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Network Error')
        }

        const data = await response.json();
        if (data.items && data.items.length > 0) {
          setSuggestedBooks(data.items.map((item) => ({
            id: item.id,
            title: item.volumeInfo.title,
            authors: item.volumeInfo.authors,
            thumbnail: item.volumeInfo.imageLinks?.thumbnail,
          })));
        } else {
          setSuggestedBooks([]);
        }
      } catch (error) {
        console.log(suggestedBooks)
        console.log('error is', error);
      }
    };

    const debounceFetchSuggestions = debounce(fetchSuggestions, 300);

    if (bookName.trim() !== '') {
      debounceFetchSuggestions();
    } else {
      setSuggestedBooks([]);
    }
  }, [bookName]);

  async function fetchBookData(bookId) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes/${bookId}?key=AIzaSyAxxpq_0aweUInshI1dAccLaJRMa77s7kI`,
        {
          headers: {
            accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Network Error')
      }

      const data = await response.json();
      setBookAuthor(data.volumeInfo?.authors[0]);
      setBookData(data);
      setShowSuggestions(false);
      setSelectedBookThumbnail(data.volumeInfo?.imageLinks?.thumbnail);
      console.log(data);

    } catch (error) {
      console.log('error is', error)
    }
  }

  async function fetchOtherBooks() {
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes/?q=inauthor:"${bookAuthor}"&maxResults=5&key=AIzaSyAxxpq_0aweUInshI1dAccLaJRMa77s7kI`,
        {
          headers: {
            accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Network Error')
      }

      const data = await response.json();
      setOtherBooks(data);
      console.log(data);

    } catch (error) {
      console.log('error is', error)
    }
  }

  useEffect(() => {
    if (bookAuthor) {
      fetchOtherBooks(bookAuthor);
    }
  }, [bookAuthor]);

  const handleBookClick = async (bookId) => {
    await fetchBookData(bookId);
  };

  const removeHtmlTags = (htmlString) => {
    const regex = /(<([^>]+)>)/gi;
    return htmlString.replace(regex, '');
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
    <div
      className="absolute top-0 left-0 w-full h-full"
      style={{
        // backgroundImage: selectedBookThumbnail ? `url(${selectedBookThumbnail})` : '',
        // filter: selectedBookThumbnail ? 'blur(5px)' : 'none',
        // backgroundSize: 'cover', 
        // backgroundPosition: 'center',
        // zIndex: -1,
      }}
    />
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">

        <h1 className="mb-4 text-2xl font-extrabold leading-none tracking-tight text-gray-900 md:text-3xl lg:text-4xl dark:text-white"> Book Recommendations - Demo </h1>
      </div>

      <div className="z-10 w-full gap-x-4 max-w-5xl flex-row font-mono text-sm lg:flex">

        <div className="w-1/2">
          <label className="block mb-4 text-1xl font-medium leading-none tracking-tight text-gray-900 md:text-1xl lg:text-2xl dark:text-white dark:text-white">Enter Book</label>
          <input
            type="text"
            id="default-input"
            value={bookName}
            onChange={(e) => { setBookName(e.target.value); setShowSuggestions(true) }}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />

          {showSuggestions && suggestedBooks.length > 0 && (
            <div className="mt-2 max-h-48 overflow-y-auto">
              {suggestedBooks
                .filter((book) => book.thumbnail)
                .map((book) => (
                  <div
                    key={book.id}
                    className="flex flex-row items-center cursor-pointer py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600"
                    onClick={() => handleBookClick(book.id)}
                  >
                      {book.thumbnail && (
                      <img
                        src={book.thumbnail}
                        alt={book.title}
                        className="w-12 mr-2"
                      />
                    )}
                    <div className="flex flex-col">
                      <div>{book.title}</div>
                      <div>By : {book.authors}</div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="z-10 w-full my-8 max-w-5xl flex-col font-mono text-sm lg:flex">
        <h2 className="block mb-4 text-1xl font-medium leading-none tracking-tight text-gray-900 md:text-1xl lg:text-2xl dark:text-white dark:text-white">About Book</h2>
        {bookData && bookData.volumeInfo ? (
          <>
            {/* Display book details */}
            <p className="text-gray-500 mb-2 dark:text-gray-400">
              <span className="text-gray-200 dark:text-gray-200">Title :</span> {bookData.volumeInfo.title}
            </p>
            <p className="text-gray-500 mb-2 dark:text-gray-400">
              <span className="text-gray-200 dark:text-gray-200">Author :</span>  {bookData.volumeInfo.authors?.join(', ')}
            </p>
            <p className="text-gray-500 mb-2 dark:text-gray-400">
              <span className="text-gray-200 dark:text-gray-200">Published Date :</span> {bookData.volumeInfo.publishedDate}
            </p>
            <p className="text-gray-500 mb-2 dark:text-gray-400">
              <span className="text-gray-200 dark:text-gray-200">Description :</span> {removeHtmlTags(bookData.volumeInfo.description)}
            </p>
            <p className="text-gray-500 mb-8 dark:text-gray-400">
              <span className="text-gray-200 dark:text-gray-200">Category :</span> {bookData.volumeInfo.categories?.join(', ')}
            </p>

            {/* Display book thumbnail */}
            {bookData.volumeInfo.imageLinks && (
              <p className="text-gray-500 mb-2 dark:text-gray-400">
                <span className="text-gray-200 dark:text-gray-200"></span>
                <img src={bookData.volumeInfo.imageLinks.thumbnail} alt={bookData.volumeInfo.title} />
              </p>
            )}
          </>
        ) : (
          <p>No book information available</p>
        )}
      </div>

      {otherBooks.items && otherBooks.items.length > 0 && (
      <div className="z-10 w-full my-8 max-w-5xl flex-col font-mono text-sm lg:flex">
        <h2 className="block mb-4 text-1xl font-medium leading-none tracking-tight text-gray-900 md:text-1xl lg:text-2xl dark:text-white dark:text-white">Other Works from the author</h2>
          <>
          {otherBooks.items.map((e) => (<div
                    key={e.id}
                    className="flex flex-row items-center cursor-pointer py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600"
                  >
                      {e.thumbnail && (
                      <img
                        src={e.thumbnail}
                        alt={e.volumeInfo.title}
                        className="w-12 mr-2"
                      />
                    )}
                    <div className="flex flex-col">
                      <div>{e.volumeInfo.title}</div>
                    </div>
                  </div>))}
          </>
      </div>)}

    </main>
  )
}
