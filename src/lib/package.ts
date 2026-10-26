// 只有 folder=2/3（Kylie的学习记录 / 课包记录）才走"课包"逻辑：
// 每满 10 条记录，下一条自动进入下一个 packageNo。
export const isPackageFolder = (folder: string) => folder === '2' || folder === '3';

// 老数据没写 packageNo 的，兜底当作 1。
export const getPackageNo = (s: { packageNo?: number }) =>
  typeof s.packageNo === 'number' ? s.packageNo : 1;

// 计算"下一条记录应该写入的 packageNo"。
// 规则：同一 studentId + folder 下，找到最大 packageNo；如果该 package 已有 >=10 条记录，则进入 +1 的新包。
export const calcNextPackageNo = (
  allSessions: { folder?: string; studentId: string; packageNo?: number }[],
  folder: string,
  studentId: string
): number | undefined => {
  if (!isPackageFolder(folder)) return undefined;

  const related = allSessions.filter(
    (s) => (s.folder ?? '1') === folder && s.studentId === studentId
  );

  if (related.length === 0) return 1;

  let maxPkg = 1;
  for (const s of related) {
    const pn = getPackageNo(s);
    if (pn > maxPkg) maxPkg = pn;
  }

  const countInMax = related.filter((s) => getPackageNo(s) === maxPkg).length;

  if (countInMax >= 10) return maxPkg + 1;
  return maxPkg;
};
