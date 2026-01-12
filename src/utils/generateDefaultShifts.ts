import type { ShiftEventDTO } from '../application/dto/ShiftEventDTO';

/**
 * デフォルトシフト（全て休み）を生成するユーティリティ関数
 *
 * @param year - 西暦年（例: 2026）
 * @param month - 月（0-11: JavaScriptのDate形式）
 * @returns ShiftEventDTO[] - 指定月の全日を「休み」イベントとして生成した配列
 *
 * @example
 * const shifts = generateDefaultShifts(2026, 0); // 2026年1月の全日を休みとして生成
 */
export function generateDefaultShifts(year: number, month: number): ShiftEventDTO[] {
  // 指定された年月の日数を取得
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const shifts: ShiftEventDTO[] = [];

  // 各日について休みイベントを生成
  for (let day = 1; day <= daysInMonth; day++) {
    // JST（UTC+9）でのタイムゾーンオフセットを明示的に指定
    const startDate = new Date(year, month, day, 0, 0, 0);
    const endDate = new Date(year, month, day, 23, 59, 59);

    // ISO 8601形式の日付文字列を生成（+09:00タイムゾーン）
    const startISO = formatToJSTISO(startDate);
    const endISO = formatToJSTISO(endDate);

    shifts.push({
      id: crypto.randomUUID(),
      summary: '休み',
      start: startISO,
      end: endISO,
      allDay: true,
    });
  }

  return shifts;
}

/**
 * DateオブジェクトをJST（Asia/Tokyo）のISO 8601形式文字列に変換
 *
 * @param date - 変換するDateオブジェクト
 * @returns ISO 8601形式の文字列（例: 2026-01-11T00:00:00+09:00）
 */
function formatToJSTISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+09:00`;
}
