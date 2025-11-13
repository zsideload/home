import { stdin as input, stdout as output } from "node:process";
import * as readline from "node:readline/promises";

export const prompt = async (question: string) => {
  let answer: string;
  const rl = readline.createInterface({ input, output });
  try {
    answer = await rl.question(question);
  } catch (error) {
    if ((error as { code: string }).code === "ABORT_ERR") {
      console.log("Exiting");
    } else {
      console.error(error);
    }
    process.exit();
  } finally {
    rl.close();
  }
  console.log();
  return answer;
};

export const confirm = async () => await prompt("Continue? ");
