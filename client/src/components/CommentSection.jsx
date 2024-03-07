import { Alert, Button, Modal, Textarea } from "flowbite-react"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import Comment from "./Comment"
import { HiOutlineExclamationCircle } from "react-icons/hi"

const CommentSection = ({ postId }) => {
    const { currentUser } = useSelector(state => state.user)
    const [comments , setcomments ] = useState('')
    const [commentError , setcommentError] = useState(null)
    const [postComments , setpostComments] = useState([])
    const [showModal , setShowModal] = useState(false)
    const [commentToDelete , setcommentToDelete] = useState(null)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(comments.length > 200){
          return;
        }
        try{
          const res = await fetch("/api/comments/create" , {
            method : "POST",
            headers : {
              'Content-Type' : 'application/json'
            },
            body : JSON.stringify({
              content : comments,
              postId,
              userId : currentUser._id
            })
          })
          const data = await res.json()
          if(res.ok){
            setcomments("")
            setcommentError(null)
            // setcomments([data , ...comments])
            setpostComments([data , ...postComments])
          }
        }catch(err){
          setcommentError(err.message)
        }
    }

    useEffect(() => {
      const getComments = async () => {
        try{
          const res = await fetch(`/api/comments/getPostComments/${postId}`)
          if(res.ok){
            const data = await res.json()
            setpostComments(data)
          }
        }catch(err){
          console.log(err.message)
        }
      }
      getComments()
    },[postId])

    const handleLike= async(commentId) => {
      try{
        if(!currentUser){
          navigate("/login")
          return;
        }
        const res = await fetch(`/api/comments/likeComment/${commentId}` , {
          method : "PUT"
        })
        if(res.ok){
          const data = await res.json()
          setpostComments(
            postComments.map((comment) => 
            comment._id === commentId
              ? {
                ...comment,
                likes : data.likes,
                numberOfLikes : data.likes.length,
              }
              : comment
            )
          )
        }
      }catch(err){

      }
    }

    const handleEdit = async(comment , editedContent) => {
      setpostComments(
        postComments.map((c) => 
          c._id === comment._id ? {...c , content : editedContent} 
          : c
        )
      )
    }

    const handleDelete =async(commentId) => {
      setShowModal(false)
      try{
        if(!currentUser){
          navigate('/login')
          return;
        }
        const res = await fetch(`/api/comments/deleteComment/${commentId}`,{
          method : "DELETE"
        })
        if(res.ok){
          const data = await res.json()
              setpostComments(postComments.filter((comment) => comment._id !== commentId))
          
        }
      }catch(err){
        console.log(err.message)
      }
    }

  return (
    <div className="max-w-2xl mx-auto w-full p-3">
      {currentUser ? (
        <div className="flex items-center gap-1 my-5 text-gray-500 text-sm">
            <p>Signed in as : </p> 
            <img className="h-5 w-5 object-cover rounded-full" src={currentUser.profilePicture} alt="image"/>
            <Link to={"/dashboard?tab=profile"} className="text-xs text-cyan-600 hover:underline">
                @{currentUser.username}
            </Link>
        </div>
      ) : (
        <div className="text-sm text-teal-500 my-5 flex gap-1">
            You must be signed in to comment
            <Link className="text-blue-500" to="/login">Sign In.</Link>
        </div>
      )}
      {currentUser && (
        <form onSubmit={handleSubmit} className="border border-teal-500 rounded-md p-3">
            <Textarea 
            placeholder='Add a comment...'
            rows ='3'
            maxLength='200'
            onChange={(e) =>setcomments(e.target.value)}
            value={comments}
            />
            <div className="flex justify-between items-center mt-5">
                <p className="text-gray-500 text-xs">{200 - comments.length} characters remaining</p>
                <Button outline gradientDuoTone='purpleToBlue' type='submit'>
                    comment
                </Button>
            </div>
            {commentError && (
              <Alert color='failure' className="mt-5">{commentError}</Alert>
            )}
        </form>
      )}
      {postComments.length === 0 ? (
        <p className="text-sm my-5">No comments yet!</p>
      ) : (
        <>
        <div className="text-sm my-5 flex items-center gap-1">
          <p>comments</p>
          <div className="border border-gray-400 py-1 px-2 rounded-sm"><p>{postComments.length}</p></div>
        </div>
        {postComments.map((comment) => (
            <Comment key={comment._id} comment={comment} onLike={handleLike} onEdit= {handleEdit} onDelete={(commentId) => {setShowModal(true) , setcommentToDelete(commentId)}} />
        ))}
        </>
      )}
      <Modal show={showModal} onClose={() => setshowModal(false)} popup size='md'>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto'/>
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">Are you Sure you want to delete this Comment</h3>
            <div className="flex justify-center gap-5">
              <Button color="failure" onClick={() => handleDelete(commentToDelete)}>Yes,Delete</Button>
              <Button color='gray' onClick={() => setShowModal(false)}>No, cancel</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default CommentSection
