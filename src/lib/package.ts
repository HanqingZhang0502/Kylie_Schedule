// 只有 folder=2/3（Kylie的学习记录 / 课包记录）才走"课包"逻辑。
export const isPackageFolder = (folder: string) => folder === '2' || folder === '3';

type PackageLike = {
  id: string;
  studentId: string;
  folder?: string;
  date?: string;
  createdAt?: { seconds?: number };
};

// 排序规则：按上课日期升序；同一天内按写入时间升序兜底；最后用 id 兜底。
const sortChronologically = (a: PackageLike, b: PackageLike) => {
  const d = String(a.date || '').localeCompare(String(b.date || ''));
  if (d !== 0) return d;

  const ta = a.createdAt?.seconds ?? 0;
  const tb = b.createdAt?.seconds ?? 0;
  if (ta !== tb) return ta - tb;

  return String(a.id).localeCompare(String(b.id));
};

// Package 编号和包内第几条（#1~#10），完全是现算出来的，不存在数据库里：
// 同一个学生 + 同一个 folder 下的所有记录，按真实上课日期从早到晚排一遍，
// 每 10 条切一包。这样记录被挪走、补记、换学生之后，受影响的那些记录
// 会自动按日期顺位重新编号，不需要单独维护"还剩几个名额"这类状态。
export function computePackagePositions<T extends PackageLike>(
  folderSessions: T[]
): Map<string, { packageNo: number; ordinal: number }> {
  const map = new Map<string, { packageNo: number; ordinal: number }>();

  const groups = new Map<string, T[]>();
  for (const s of folderSessions) {
    if (!groups.has(s.studentId)) groups.set(s.studentId, []);
    groups.get(s.studentId)!.push(s);
  }

  for (const [, arr] of groups) {
    const sorted = [...arr].sort(sortChronologically);
    sorted.forEach((s, idx) => {
      map.set(s.id, { packageNo: Math.floor(idx / 10) + 1, ordinal: (idx % 10) + 1 });
    });
  }

  return map;
}

// 模拟"如果把这条记录（新建或编辑）放进去，会落在第几包第几条"，
// 用于 Dashboard 快速记录 / History 编辑弹窗的实时预览。
// allSessions 传完整的 sessions 列表；excludeId 传正在编辑的那条记录的 id
// （新建时不传），避免它的旧数据被重复计入。
export function previewPackagePosition(
  allSessions: PackageLike[],
  folder: string,
  studentId: string,
  date: string,
  excludeId?: string
): { packageNo: number; ordinal: number } | undefined {
  if (!isPackageFolder(folder) || !studentId) return undefined;

  const related = allSessions.filter(
    (s) => (s.folder ?? '1') === folder && s.studentId === studentId && s.id !== excludeId
  );

  const placeholder: PackageLike = {
    id: '__preview__',
    studentId,
    folder,
    date,
    createdAt: { seconds: Number.MAX_SAFE_INTEGER },
  };

  const combined = [...related, placeholder].sort(sortChronologically);
  const idx = combined.findIndex((s) => s.id === '__preview__');

  return { packageNo: Math.floor(idx / 10) + 1, ordinal: (idx % 10) + 1 };
}
