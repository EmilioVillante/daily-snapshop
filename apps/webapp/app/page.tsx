import getCollection from '@/utils/get-collection';
import {SnapshotModel} from "@/types/snapshot";
import { getDocs, QuerySnapshot } from "firebase/firestore";
import Snapshot from '@/components/Snapshot';

export default async function Home() {
  const query: QuerySnapshot<SnapshotModel> = await getDocs(await getCollection());

  const snapshots = query.docs.map((doc) => doc.data())

  return (
    <main>
      <div className="grid grid-cols-4 gap-4">
          {...snapshots.map(doc => <Snapshot snapshot={doc}/>)}
      </div>
    </main>
  )
}
