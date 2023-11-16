import { useEffect, useState } from "react";
import axios from "axios";

export default function NewPost() {
  const [file, setFile] = useState();
  const [caption, setCaption] = useState("");
  const [data, setData] = useState([]);

  const submit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", caption);

    await axios.post("http://localhost:3000/api/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const getPhoto = async () => {
    const response = await axios.get("http://localhost:3000/api/posts");
    setData(response.data);
  };

  useEffect(() => {
    getPhoto();
  }, [file, caption]);

  console.log(data);

  return (
    <>
      <form onSubmit={(e) => submit(e)}>
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          accept="image/*"
        ></input>
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          type="text"
          placeholder="Caption"
        ></input>
        <button type="submit">Submit</button>
      </form>
      <div>
        {data.map((post) => (
          <div key={post._id}>
            <img src={post.imageUrl} alt="" />
          </div>
        ))}
      </div>
    </>
  );
}
