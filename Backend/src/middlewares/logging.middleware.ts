import morgan from "morgan";
import chalk from "chalk";
morgan.token("user", (req: any) => {
  return req.user ? `UserID: ${req.user.id}` : "Anonymous";
});

export const loggingMiddleware = morgan((tokens, req, res) => {
  return [
    chalk.cyan.bold(tokens.method(req, res)),
    chalk.yellow(tokens.url(req, res)),
    chalk.green(tokens.status(req, res)),
    "-",
    chalk.magenta(`${tokens["response-time"](req, res)} ms`),
    "-",
    chalk.blue(tokens.user(req, res)),
  ].join(" ");
});
