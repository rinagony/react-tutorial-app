import Header from "./Header";
import Nav from "./Nav";
import Footer from "./Footer";
import Home from "./Home";
import NewPost from "./NewPost";
import PostPage from "./PostPage";
import EditPost from "./EditPost";
import About from "./About";
import Missing from "./Missing";
import { Route, Switch, useHistory } from "react-router-dom";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import api from "./api/posts";

function App() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const history = useHistory();

  useEffect(() => {//calling after all rendered
    const fetchPosts = async () => { //get posts from fake api
      try {
        const response = await api.get("/posts");
        setPosts(response.data);
      } catch (err) {
        if (err.response) {
          // Not in the 200 response range
          console.log(err.response.data);
          console.log(err.response.status);
          console.log(err.response.headers);
        } else {
          console.log(`Error: ${err.message}`);
        }
      }
    };

    fetchPosts(); //calling anon function
  }, []);

  useEffect(() => { 
    if (posts.length > 0 || posts !== undefined || posts !== null) { //if posts are ok
      const filteredResults = posts.filter( //filter posts (stay posts which include search)
        (post) =>
          post.body.toLowerCase().includes(search.toLowerCase()) ||
          post.title.toLowerCase().includes(search.toLowerCase())
      );

      setSearchResults(filteredResults.reverse());
    }
  }, [posts, search]); //when posts or search chenging call useEffect

  const handleSubmit = async (e) => { //add new post
    e.preventDefault();
    const id = posts.length ? posts[posts.length - 1].id + 1 : 1; //set id to new post
    const datetime = format(new Date(), "MMMM dd, yyyy pp"); //get today date
    const newPost = { id, title: postTitle, datetime, body: postBody }; //formatting object of a new post
    try {
      const response = await api.post("/posts", newPost); //add new post to others
      const allPosts = [...posts, response.data]; //change state of posts
      setPosts(allPosts);
      setPostTitle(""); //clear inputs
      setPostBody("");
      history.push("/");
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
  };

  const handleEdit = async (id) => { //edit post
    const datetime = format(new Date(), "MMMM dd, yyyy pp"); //set new date
    const updatedPost = { id, title: editTitle, datetime, body: editBody }; //updating post
    try {
      const response = await api.put(`/posts/${id}`, updatedPost); //put method change exist data in api
      setPosts(
        posts.map((post) => (post.id === id ? { ...response.data } : post)) //edit  item in state
      );
      setEditTitle("");
      setEditBody("");
      history.push("/"); //go to home page
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/posts/${id}`); //delete method api
      const postsList = posts.filter((post) => post.id !== id); //stay post if it != id which we got
      setPosts(postsList);
      history.push("/");
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
  };

  return (
    <div className="App">
      <Header title="React JS Blog" />
      <Nav search={search} setSearch={setSearch} />
      <Switch>
        <Route exact path="/">
          <Home posts={searchResults} />
        </Route>
        <Route exact path="/post">
          <NewPost
            handleSubmit={handleSubmit}
            postTitle={postTitle}
            setPostTitle={setPostTitle}
            postBody={postBody}
            setPostBody={setPostBody}
          />
        </Route>
        <Route path="/edit/:id">
          <EditPost
            posts={posts}
            handleEdit={handleEdit}
            editTitle={editTitle}
            setEditTitle={setEditTitle}
            editBody={editBody}
            setEditBody={setEditBody}
          />
        </Route>
        <Route path="/post/:id">
          <PostPage posts={posts} handleDelete={handleDelete} />
        </Route>
        <Route path="/about" component={About} />
        <Route path="*" component={Missing} />
      </Switch>
      <Footer />
    </div>
  );
}

export default App;
