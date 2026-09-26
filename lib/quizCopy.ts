/**
 * Fills the quiz intro template: "{count}" becomes the number of yes/no
 * questions and "{price}" the live course price.
 * Keeps the copy right when questions or the price change.
 */
export function quizIntroText(template: string, questions: readonly unknown[], price: string): string {
  return template.replaceAll("{count}", String(questions.length)).replaceAll("{price}", price);
}
