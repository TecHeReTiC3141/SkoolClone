import { getCommunityFromSlug } from "@/app/lib/db/community";
import { redirect } from "next/navigation";
import Image from "next/image"
import { CommunityAccessLevel } from "@prisma/client";
import { FaGlobe, FaLock } from "react-icons/fa6";
import { FiUsers } from "react-icons/fi";
import { formatMemberCount, formatPrice } from "@/app/lib/utils/formating";
import Link from "next/link";
import Carousel from "@/app/communities/[communitySlug]/about/Carousel";


interface CommunityAboutPageProps {
    params: {
        communitySlug: string,
    },
}

export default async function CommunityAboutPage({params: {communitySlug}}: CommunityAboutPageProps) {
    console.log("in about page", communitySlug);
    const community = await getCommunityFromSlug(communitySlug);

    if (!community) {
        return redirect("/404");
    }

    return (
        <div className="w-full flex flex-col gap-6 bg-neutral rounded-xl px-6 py-6">
            <h2 className="font-bold text-xl">{community.name}</h2>
            {community.aboutImages.length > 0 ? <Carousel pics={community.aboutImages}/> :
                <Image src={community.thumb} alt={community.name} width={800} height={600}
                       className="w-full max-h-96 rounded-lg object-cover" />}
            <div className="flex items-center gap-12 text-lg ">
                <p className="flex gap-1 items-center">{community.accessLevel === CommunityAccessLevel.PUBLIC ?
                    <FaGlobe/> : <FaLock/>}
                    {community.accessLevel[ 0 ] + community.accessLevel.slice(1).toLowerCase()} group</p>
                <p className="flex gap-1 items-center"><FiUsers/>{formatMemberCount(community._count.members)} members
                </p>
                <p className="flex gap-1 items-center">
                    <FiUsers/>{community.price ? formatPrice(community.price) + "/month" : "Free"}</p>
                <p className="flex gap-1 items-center"><Link href={`/users/${community.creator.slug}`}>
                    <Image className="rounded-full h-6 w-6 mr-4"
                           src={community.creator.image as string}
                           alt={community.creator.name || ""}
                           width={160} height={160}/></Link> by {community.creator.name}</p>
            </div>
            <p className="flex gap-1 items-center">{community.aboutDescription || community.description}</p>
        </div>
    )
}