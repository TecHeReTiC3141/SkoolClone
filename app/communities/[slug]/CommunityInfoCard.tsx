import Image from "next/image";
import {FaGlobe, FaLock} from "react-icons/fa6";
import {CommunityAccessLevel} from "@prisma/client";
import {checkIfUserInCommunity, CommunityWithMemberCount, CommunityWithMembers} from "@/app/lib/db/community";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/lib/config/authOptions";

interface CommunityInfoCardProps {
    community: CommunityWithMemberCount & CommunityWithMembers,
}

export default async function CommunityInfoCard({community}: CommunityInfoCardProps) {

    const session = await getServerSession(authOptions);

    const isMember = session && (await checkIfUserInCommunity(session.user.id, community.id))

    return (
        <div className="card card-compact min-w-72 w-72 bg-neutral shadow-xl">
            <figure><Image src={community.thumb} alt={community.name}
                           width={280} height={280} className="w-full"/></figure>
            <div className="card-body">
                <h2 className="card-title">{community.name}</h2>
                <p className="text-sm flex gap-1 items-center">{community.accessLevel === CommunityAccessLevel.PUBLIC ? <FaGlobe /> : <FaLock />}
                    {community.accessLevel[0] + community.accessLevel.slice(1).toLowerCase()} group</p>
                <p className="text-sm">@{community.slug}</p>
                <p className="text-sm">{community.description}</p>

                <div className="divider h-1 my-0"></div>
                <div className="flex justify-between w-full px-4">
                    <button className="bg-transparent flex flex-col items-center">
                        <p className="text-lg">{community._count.members}</p>
                        <span className="text-sm">members</span>
                    </button>

                    <div className="divider divider-horizontal w-1 mx-1"></div>

                    <button className="bg-transparent flex flex-col items-center">
                        <p className="text-lg">{community._count.members}</p>
                        <span className="text-sm">online</span>
                    </button>
                    <div className="divider divider-horizontal w-1 mx-1"></div>
                    <button className="bg-transparent flex flex-col items-center">
                        <p className="text-lg">1</p>
                        <span className="text-sm">admins</span>
                    </button>
                </div>
                <div className="divider h-1 my-0"></div>
                {isMember ? <button className="btn btn-block btn-primary uppercase">Settings</button> :
                    <button className="btn btn-block btn-primary uppercase">Join group</button>
                }
            </div>
        </div>
    )
}