"use client"

import {CommunityPagePost} from "@/app/lib/db/post";
import UserAvatar from "@/app/users/[slug]/UserAvatar";
import Link from "next/link";
import {FaRegComment} from "react-icons/fa6";
import {formatTimeAgo} from "@/app/lib/utils/formating";
import {SessionUser} from "@/app/lib/db/user";
import LikeButton from "@/app/communities/[slug]/community/LikeButton";
import OpenedPost from "@/app/communities/[slug]/community/OpenedPost";
import {useState} from "react";

interface PostCardProps {
    user: NonNullable<SessionUser>,
    isLikeSet: boolean,
    post: CommunityPagePost,
}

export default function PostCard({user, post, isLikeSet}: PostCardProps) {

    const [ isOpened, setIsOpened ] = useState(false);

    return (
        <>
            <div onClick={async () => {
                await (async () => setIsOpened(true))();
                const modal = document.getElementById(`opened_post_${post.slug}`) as HTMLDialogElement;
                modal.showModal();
            }}
                 className="w-full rounded-lg bg-neutral p-4 cursor-pointer">
                <div className="flex gap-3 items-center">
                    <UserAvatar user={post.creator} width={32} height={32}/>
                    <div>
                        <Link className="font-bold" href={`/users/${post.creator.slug}`}>{post.creator.name}</Link>
                        <p className="text-sm">{formatTimeAgo(post.createdAt)}</p>
                    </div>
                </div>
                <h3 className="font-bold text-xl my-2">{post.title}</h3>
                <p>{post.content}</p>
                <div className="flex gap-4 mt-4">
                    <div className="flex gap-2 items-center">
                        <LikeButton disabled={post.creatorId === user.id} userId={user.id} postId={post.id}
                                    isLikeSet={isLikeSet} className="btn btn-ghost btn-circle btn-sm text-lg flex"/>
                        {post._count.userLikes}
                    </div>
                    <div className="flex gap-2 items-center">
                        <FaRegComment/> {post._count.comments}
                    </div>
                </div>
            </div>
            {isOpened && <OpenedPost user={user} isLikeSet={isLikeSet} post={post}/>}
        </>
    )
}