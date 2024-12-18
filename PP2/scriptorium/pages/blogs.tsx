// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import NavBar from "@/components/general/nav-bar";
// import BlogSearch from "./blogs/blog-search";

// interface BlogPost {
//   id: number;
//   title: string;
//   description: string;
//   tags: { name: string }[];
//   codeTemplate: { title: string }[];
// }

// const BlogList: React.FC = () => {
//   const [blogs, setBlogs] = useState<BlogPost[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchBlogs = async (
//     params: URLSearchParams = new URLSearchParams()
//   ) => {
//     setLoading(true);
//     setError(null);

//     try {
//       const response = await fetch(`/api/blogs?${params.toString()}`);
//       if (!response.ok) {
//         throw new Error("Failed to fetch blogs");
//       }

//       const data = await response.json();
//       setBlogs(data);
//     } catch (err) {
//       console.error("Error fetching blogs:", err);
//       setError("Failed to fetch blogs. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = async ({
//     query,
//     tags,
//     codeTemplate,
//   }: {
//     query?: string;
//     tags?: string[];
//     codeTemplate?: string;
//   }) => {
//     const params = new URLSearchParams();
//     if (query) params.append("query", query);
//     if (tags && tags.length > 0) params.append("tags", tags.join(","));
//     if (codeTemplate) params.append("codeTemplate", codeTemplate);

//     await fetchBlogs(params);
//   };

//   // Fetch all blogs when the component mounts
//   useEffect(() => {
//     fetchBlogs();
//   }, []);

//   return (
//     <div className="blog-list">
//       <NavBar />
//       <h1>Search Blog Posts</h1>
//       <BlogSearch onSearch={handleSearch} />

//       <main>
//         {loading && <p className="loading">Loading blogs...</p>}
//         {error && <p className="error">{error}</p>}
//         {!loading && blogs.length === 0 && !error && (
//           <p className="no-blogs">
//             No blogs found. Try adjusting your search criteria.
//           </p>
//         )}
//         <ul className="blogs">
//           {blogs.map((blog) => (
//             <li key={blog.id} className="blog-item">
//               <h2>
//                 <Link href={`/blogs/${blog.id}`}>{blog.title}</Link>
//               </h2>
//               <p>{blog.description}</p>
//               <p>Tags: {blog.tags.map((tag) => `#${tag.name}`).join(", ")}</p>
//               <p>
//                 Code Templates:{" "}
//                 {blog.codeTemplate.map((template) => template.title).join(", ")}
//               </p>
//             </li>
//           ))}
//         </ul>
//       </main>
//     </div>
//   );
// };

// export default BlogList;
import React, { useState, useEffect } from "react";
import Link from "next/link";
import NavBar from "@/components/general/nav-bar";
import BlogSearch from "./blogs/blog-search";

interface BlogPost {
  id: number;
  title: string;
  description: string;
  tags: { name: string }[];
  codeTemplate: { title: string }[];
}

const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogs = async (params: URLSearchParams = new URLSearchParams()) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/blogs?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch blogs");
      }

      const data = await response.json();
      setBlogs(data);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Failed to fetch blogs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async ({
    searchField,
    query,
  }: {
    searchField: string;
    query: string | string[];
  }) => {
    const params = new URLSearchParams();
    if (typeof query === "string") {
      params.append(searchField, query);
    } else {
      params.append(searchField, query.join(","));
    }

    await fetchBlogs(params);
  };

  const handleReset = async () => {
    await fetchBlogs(); // Reset to fetch all blogs
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <>
    <NavBar></NavBar>
      <div className="blog-list">
        <h1 className="text-4xl font-bold text-center mb-4 text-gray-700">
          Search Blog Posts
        </h1>
        <BlogSearch onSearch={handleSearch} />
        <button
          onClick={handleReset}
          className="reset-button bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-md mb-4"
        >
          Reset
        </button>
        <main>
          {loading && <p className="loading">Loading blogs...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && blogs.length === 0 && !error && (
            <p className="no-blogs">
              No blogs found. Try adjusting your search criteria.
            </p>
          )}
          <div className="blogs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="blog-card border shadow-md p-4 rounded-md flex flex-col"
              >
                <h2 className="text-lg font-semibold mb-2">
                  <Link
                    href={`/blogs/${blog.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    {blog.title}
                  </Link>
                </h2>
                <p className="description text-sm text-gray-700 mb-2">
                  {blog.description}
                </p>
                <div className="tags mt-2 flex gap-2 mb-2">
                  {blog.tags.map((tag, index) => (
                    <span
                      key={`${blog.id}-tag-${index}`} // Ensures unique key
                      className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
                <div className="code-templates text-sm text-gray-500">
                  <strong>Code Templates:</strong>{" "}
                  {blog.codeTemplate.length > 0
                    ? blog.codeTemplate.map((template, index) => (
                        <span
                          key={`${blog.id}-template-${index}`} // Ensures unique key
                          className="text-gray-700"
                        >
                          {template.title}
                          {index < blog.codeTemplate.length - 1 && ", "}
                        </span>
                      ))
                    : "None"}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default BlogList;