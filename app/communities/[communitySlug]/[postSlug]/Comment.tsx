"use client"

import UserAvatar from "@/app/users/[userSlug]/UserAvatar";
import Link from "next/link";
import {addComment, PostComment, setLike, unsetLike} from "@/app/lib/db/comment";
import {formatTimeAgo} from "@/app/lib/utils/formating";
import LikeButton from "@/app/communities/[communitySlug]/community/LikeButton";
import CommentsList from "@/app/communities/[communitySlug]/[postSlug]/CommentsList";
import {SessionUser} from "@/app/lib/db/user";
import AddCommentForm from "@/app/communities/[communitySlug]/[postSlug]/AddCommentForm";
import clsx from "clsx";
import {BsThreeDots} from "react-icons/bs";
import {CommentsByParentId} from "@/app/communities/[communitySlug]/[postSlug]/OpenedPost";

interface CommentProps {
    comment: PostComment,
    commentByParentId: CommentsByParentId,
    user: NonNullable<SessionUser>,
    isLikeSet: boolean,
}

export default function Comment({user, isLikeSet, comment, commentByParentId}: CommentProps) {

    const isOwner = user.id === comment.creator.id;

    return (

        <div className="w-full flex gap-2">
            <UserAvatar user={comment.creator} width={36} height={36}/>
            <div className="w-full">
                <div className={clsx(["relative rounded-lg px-2 pt-2 pb-3 w-full",
                    isOwner ? "bg-primary text-primary-content" : "bg-base-200 text-base-content" ])}>
                    <div className="flex gap-2 items-center mb-1">
                        <Link href={`/users/${comment.creator.slug}`}
                              className="font-bold hover:underline text-sm">{comment.creator.name}</Link>
                        <p className="text-xs">{formatTimeAgo(comment.createdAt)}</p>
                    </div>
                    <p>{comment.content}</p>
                    <div className="dropdown dropdown-end  absolute right-2 top-2">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-xs p-1 rounded-full"><BsThreeDots
                            className="text-lg"/></div>
                        <ul tabIndex={0}
                            className="dropdown-content bg-neutral text-neutral-content z-[1] menu p-2 shadow rounded-box w-52">
                            {isOwner && <>
                                <li><div>Edit</div></li>
                                <li><div>Delete</div></li>
                            </>}
                            <li><div>Copy the link</div></li>
                            <li><div>Report to admins</div></li>

                        </ul>
                    </div>
                </div>
                <div className="flex gap-2 items-center mt-1 flex-wrap">
                    <LikeButton userId={user.id} postId={comment.id} isLikeSet={isLikeSet}
                                disabled={isOwner}
                                unsetLike={unsetLike} setLike={setLike}
                                className="btn btn-ghost btn-circle btn-sm text-lg flex"/>
                    {comment._count.userLikes}
                    <AddCommentForm user={user} parentId={comment.id} postId={comment.postId} addComment={addComment}
                                    initialValue={comment.creator.name || ""}/>
                </div>
                <CommentsList user={user} comments={commentByParentId[comment.id]} commentByParentId={commentByParentId}/>
            </div>
        </div>

    )
}