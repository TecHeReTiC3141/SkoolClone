"use server"

import prisma from "@/app/lib/db/prisma";
import {Community, CommunityAccessLevel, CommunityUserRole} from "@prisma/client";
import {redirect} from "next/navigation";
import slugify from "slugify";
import {SessionUser} from "@/app/lib/db/user";

export type CreateCommunityData = {
    creatorId: string,
    name: string,
    price: number,
    accessLevel: CommunityAccessLevel,
    thumb: string,
    icon: string,
    filters: string[],
    description: string,
    aboutDescription: string | null,
    aboutImages: string[],
}

export type CommunityMembershipData = {
    name: string,
    icon: string,
    accessLevel: CommunityAccessLevel,
    slug: string,
    _count: {
        members: number,
    }
}

export async function createCommunity({
                                          creatorId,
                                          name,
                                          price,
                                          accessLevel,
                                          thumb,
                                          filters,
                                          icon,
                                          description,
                                          aboutDescription,
                                          aboutImages,
                                      }: CreateCommunityData) {
    const slug = slugify(name, {lower: true});
    await prisma.community.create({
        data: {
            name,
            price,
            accessLevel,
            thumb,
            slug,
            filters,
            icon,
            description,
            aboutDescription,
            aboutImages,
            creator: {
                connect: {id: creatorId}
            },
            members: {
                create: {
                    userId: creatorId,
                    role: CommunityUserRole.ADMIN,
                }
            }
        }
    });
    return redirect(`/communities/${slug}/community`);
}

export type CommunityWithMemberCount = Community & {
    _count: {
        members: number
    }
};

export type CommunityWithMembers = Community & {
    members: {
        user: SessionUser
    }[]
};

export type CommunityWithCreator = Community & {
    creator:  NonNullable<SessionUser>,
};

export type CommunityWithAllMembers = CommunityWithMemberCount & CommunityWithMembers & CommunityWithCreator;


export async function getMainPageCommunities(): Promise<CommunityWithMemberCount[]> {
    return await prisma.community.findMany({
        orderBy: {
            members: {
                _count: "desc",
            }
        },
        include: {
            _count: {
                select: {members: true},
            },
        }
    });
}

export async function getCommunityFromSlug(slug: string): Promise<CommunityWithAllMembers | null> {
    return await prisma.community.findUnique({
        where: {slug},
        include: {
            _count: {
                select: {members: true},
            },
            creator: {
                select: {
                    name: true,
                    slug: true,
                    image: true,
                    id: true,
                    email: true,
                },
            },
            members: {
                select: {
                    user: {
                        select: {
                            name: true,
                            slug: true,
                            image: true,
                            id: true,
                            email: true,
                        }
                    },
                }
            },
        }
    })
}

export async function checkIfUserInCommunity(userId: string, communityId: string) {
    const community = await prisma.community.findUnique({
        where: {
            id: communityId,
        },
        select: {
            members: {
                where: {
                    userId,
                }
            }
        }
    });
    return community && community.members.length > 0;
}