"use server"

import slugify from "slugify";
import prisma from "@/app/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { Comment, User } from "@prisma/client";

// COMMENTS
export interface CommentCreateData {
    answeredPostId: string,
    content: string,
    creatorId: string,
    parentId?: string | null,
}

export async function addComment({answeredPostId, content, creatorId, parentId = null}: CommentCreateData) {
    const slug = slugify(content + "-" + Math.round(Math.random() * 10000), {lower: true});
    if (parentId === null) {
        await prisma.comment.create({
            data: {
                content,
                creator: {connect: {id: creatorId}},
                post: {connect: {id: answeredPostId}}
            }
        });
    } else {
        await prisma.comment.create({
            data: {
                content,
                creator: {connect: {id: creatorId}},
                post: {connect: {id: answeredPostId}},
                parent: {connect: {id: parentId}},
            }
        });
    }
    revalidatePath("/communities/[communitySlug]/community", "page");
}

export type CommentWithCreator = Comment & { creator: User };

export type CommentWithLikesCount = Comment & { _count: { userLikes: number } };

export type PostComment = CommentWithCreator & CommentWithLikesCount & {isLikeSet?: boolean};

export type PostComments = { comments: PostComment[] };

export async function getPostComments(postId: string): Promise<PostComments> {
    return (await prisma.post.findUnique({
        where: {
            id: postId,
        },
        select: {
            comments: {
                include: {
                    creator: true,
                    _count: {
                        select: {
                            userLikes: true,
                        }
                    }
                }
            }
        }
    }))!;
}

// LIKES

export async function isCommentLiked(userId: string, commentId: string) {
    return !!await prisma.comment.findUnique({
        where: {
            id: commentId,
            userLikes: {
                some: {
                    id: userId,
                }
            }
        }
    })
}

export async function setCommentLike(userId: string, commentId: string) {
    await prisma.comment.update({
        where: {
            id: commentId,
        },
        data: {
            userLikes: {connect: {id: userId}},
        }
    });
    revalidatePath("/communities/[communitySlug]/community", "page");
}

export async function unsetCommentLike(userId: string, commentId: string) {
    await prisma.comment.update({
        where: {
            id: commentId,
        },
        data: {
            userLikes: {disconnect: {id: userId}},
        }
    });
    revalidatePath("/communities/[communitySlug]/community", "page");
}

// EDITING

export async function updateComment(commentId: string, newComment: string) {
    await prisma.comment.update({
        where: {
            id: commentId,
        },
        data: {
            content: newComment,
        }
    });
    revalidatePath("/communities/[communitySlug]/community", "page");
}

export async function deleteComment(commentId: string) {

    const comments = await prisma.comment.findMany({
        where: { parentId: commentId },
        select: {
            id: true,
        }
    });

    for (let comment of comments) {
        await deleteComment(comment.id);
    }

    await prisma.comment.delete({
        where: {
            id: commentId,
        },
    });

    revalidatePath("/communities/[communitySlug]/community", "page");
}