import React, { useEffect, useState, useRef } from "react";
import axios, { AxiosError } from "axios";

const url =
  process.env.NODE_ENV === "production"
    ? "https://snip-snap-back.onrender.com"
    : "http://localhost:4000";

interface SnipSnapType {
  id: number;
  date: Date;
  title: null | string;
  body: string;
}

interface SnipSnapComment {
  comment_id: number;
  snipSnap_id: number;
  comment_body: string;
  date: Date;
}

export default function MainContent(): JSX.Element {
  const [snipSnapBody, setSnipSnapBody] = useState<string>("");
  const [snipSnapTitle, setSnipSnapTitle] = useState<string>("");
  const [allData, setAllData] = useState<SnipSnapType[]>([]);
  const [allComments, setAllComments] = useState<SnipSnapComment[]>([]);
  //creating a function for individual snaps
  interface SnapProps {
    snap: SnipSnapType;
    allCommProps: SnipSnapComment[];
    handleSubmitEditSnipSnap: (id: number, message: string) => void;
  }

  //creating a single component for an individual snap
  const SnapItem: React.FC<SnapProps> = (props: SnapProps) => {
    const sliceLength = 450;
    const { snap, allCommProps, handleSubmitEditSnipSnap } = props;

    const [commentBody, setCommentBody] = useState<string>("");
    const [leaveCommentVis, setLeaveCommentVis] = useState<boolean>(false);
    const [CommsVis, setCommsVis] = useState<boolean>(false);
    const [comments, setComments] = useState<SnipSnapComment[]>(
      allCommProps.filter((el) => el.snipSnap_id === snap.id)
    );
    const [fullBody, setFullBody] = useState("");
    const [editSnipSnap, setEditSnipSnap] = useState<boolean>(false);
    const [editSnipSnapText, setEditeSnipSnapText] = useState<string>(
      snap.body
    );

    // useEffect(() => {
    //   getSnipSnaps();
    // }, [editSnipSnapText])

    const handleReadMore = (body: string) => {
      setFullBody(body.slice(sliceLength, body.length));
      if (fullBody.length > 0) {
        setFullBody("");
      }
    };

    //creating a function the deletes a comment
    const deleteComment = async (id: number) => {
      try {
        await axios.delete(`${url}/comments/${id}`);
      } catch (error) {
        console.error(error);
      }
    };
    const handleDeleteCommentButton = (id: number) => {
      deleteComment(id).then(() => getAllComments());
    };

    //creating a function to handle deleting a snip snap and its comments
    const deleteSnipSnap = async (id: number) => {
      try {
        await axios.delete(`${url}/snip_snaps/${id}`);
      } catch (error) {
        console.error(error);
      }
    };
    const handleDeleteSnipSnapButton = (id: number) => {
      deleteSnipSnap(id).then(() => getSnipSnaps());
    };
    const postComment = async (id: number, newComment: string) => {
      try {
        await axios.post(`${url}/comments`, {
          snipSnapID: id,
          commentBody: newComment,
        });
      } catch (error) {
        console.error(error);
      }
    };
    const handleSubmitComment = (id: number, comment: string) => {
      if (comment.length < 1) {
        alert("you can't post an empty comment either bro omd...");
      } else {
        postComment(id, comment)
          .then(() => getAllComments())
          .then(() => {
            if (!CommsVis) {
              handleOpenComments();
            }
          });
        setCommentBody("");
      }
    };

    const handleOpenComments = () => {
      setCommsVis(!CommsVis);
      setLeaveCommentVis(!leaveCommentVis);
    };

    const handleEditSnipSnapButton = () => {
      setEditSnipSnap(true);
    };

    return (
      <div key={snap.id}>
        <p>
          {snap.title ? (
            <>
              {snap.title} | {snap.date}
            </>
          ) : (
            <>{snap.date}</>
          )}
          <span>
            <button
              className="del-com-btn"
              onClick={() => handleDeleteSnipSnapButton(snap.id)}
            >
              ❌
            </button>
            <button
              className="del-com-btn"
              onClick={() => handleEditSnipSnapButton()}
            >
              📝
            </button>
          </span>
        </p>

        {editSnipSnap ? (
          <>
            <textarea
              value={editSnipSnapText}
              onChange={(e) => setEditeSnipSnapText(e.target.value)}
            ></textarea>
            <button
              onClick={() =>
                handleSubmitEditSnipSnap(snap.id, editSnipSnapText)
              }
            >
              save
            </button>
          </>
        ) : (
          <p>
            {snap.body.slice(0, sliceLength)}
            <span>{fullBody}</span>
          </p>
        )}
        <span>
          {snap.body.length > sliceLength && fullBody.length < 1 && (
            <button value={fullBody} onClick={() => handleReadMore(snap.body)}>
              More
            </button>
          )}
          <button onClick={handleOpenComments}>Leave a comment</button>
          {comments.length > 0 && !CommsVis && (
            <button onClick={handleOpenComments}>View comments</button>
          )}
          {comments.length > 0 && CommsVis && (
            <button onClick={handleOpenComments}>Hide Comments</button>
          )}
        </span>
        {fullBody.length > 0 && (
          <button value={fullBody} onClick={() => handleReadMore(snap.body)}>
            Less
          </button>
        )}
        <br />
        {leaveCommentVis && (
          <div>
            <textarea
              onChange={(e) => setCommentBody(e.target.value)}
              value={commentBody}
            ></textarea>
            <button
              onClick={() => {
                handleSubmitComment(snap.id, commentBody);
                setEditSnipSnap(!editSnipSnap);
              }}
            >
              📩
            </button>
          </div>
        )}
        {comments.length > 0 && CommsVis && (
          <div>
            <h3>Comments</h3>
            {comments.map((el) => {
              return (
                <>
                  <p key={el.comment_id}>
                    {el.comment_body}
                    <span>
                      <button
                        className="del-com-btn"
                        onClick={() => handleDeleteCommentButton(el.comment_id)}
                      >
                        🗑️
                      </button>
                    </span>
                  </p>
                </>
              );
            })}
          </div>
        )}
        <hr />
      </div>
    );
  };

  useEffect(() => {
    getSnipSnaps();
    getAllComments();
  }, [allData.length, allComments.length]);

  //GET snipSnaps from API
  const getSnipSnaps = async () => {
    console.log("getSnipSnaps works");
    try {
      const response = await axios.get(url + "/snip_snaps");
      setAllData(response.data);
    } catch (error) {
      console.error("Woops... issue with GET request: ", error);
    }
  };

  //GET Allcomments from API
  const getAllComments = async () => {
    try {
      const response = await axios.get(url + `/comments`);
      setAllComments(response.data);
    } catch (error) {
      console.error("Woops... issue with GET request: ", error);
    }
  };

  //POST snip snaps to API
  const postSnipSnaps = async (newBody: string, newTitle?: string) => {
    console.log("postSnipSnaps function is running!");
    try {
      if (newBody.length < 1) {
        alert("You can't post an empty snap bruh😂😂😂");
      } else {
        await axios.post(url + "/snip_snaps", {
          body: newBody,
          title: newTitle,
        });
      }
    } catch (error) {
      console.error("Woops... issue with POST request: ", error);
    }
  };
  const handlePost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    snipSnapTitle === ""
      ? postSnipSnaps(snipSnapBody)
      : postSnipSnaps(snipSnapBody, snipSnapTitle).then(() => getSnipSnaps());
    setSnipSnapBody("");
    setSnipSnapTitle("");
  };

  //this is the edit request to edit a snip snap
  const putEditedSnipSnap = async (id: number, editedMessage: string) => {
    try {
      axios.put(`${url}/snip_snaps`, { body: editedMessage, id: id });
    } catch (error) {
      console.log("failed to carry out request");
    }
  };

  //this function handles
  const handleSubmitEditSnipSnap = (id: number, message: string) => {
    putEditedSnipSnap(id, message)
      .then(() => getSnipSnaps())
      .then(() => getSnipSnaps());
  };

  return (
    <>
      <h1>
        WELCOME TO SNIP SNAP{" "}
        <img src="../logo.png" alt="" className="logo-image" />
      </h1>
      <form onSubmit={handlePost} className="snap-form">
        <input
          className="input-title"
          placeholder="title"
          type="text"
          value={snipSnapTitle}
          onChange={(e) => setSnipSnapTitle(e.target.value)}
        />
        <textarea
          className="input-body"
          placeholder="Type your snip snap..."
          value={snipSnapBody}
          onChange={(e) => setSnipSnapBody(e.target.value)}
        ></textarea>
        <button type="submit" className="submit-button">
          Post
        </button>
      </form>
      {allData.length > 0 && (
        <>
          <h1>Snips & Snaps</h1>
          {allData.map((el) => (
            <SnapItem
              key={el.id}
              snap={el}
              allCommProps={allComments}
              handleSubmitEditSnipSnap={handleSubmitEditSnipSnap}
            />
          ))}
        </>
      )}
    </>
  );
}
