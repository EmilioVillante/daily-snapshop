import { Inter } from '@next/font/google'
import Image from 'next/image'
import {SnapshotModel} from "@/types/snapshot";

const inter = Inter({ subsets: ['latin'] })

type Props = {
    snapshot: SnapshotModel
}

export default function Snapshot({snapshot}: Props) {
    return (
        <div className="flex-1">
            <Image
                src={snapshot.cloudinaryUrl}
                alt="Picture of the days daily snapshot"
                width={512}
                height={512}
            />
            <p className={`${inter.className} mt-4 font-semibold`}>{snapshot.prompt}</p>
        </div>
    )
}