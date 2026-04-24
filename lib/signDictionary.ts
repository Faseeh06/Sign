export const aslAlphabet: Record<string, string> = {
  a: "https://www.lifeprint.com/asl101/gifs/a/a.gif",
  b: "https://www.lifeprint.com/asl101/gifs/b/b.gif",
  c: "https://www.lifeprint.com/asl101/gifs/c/c.gif",
  d: "https://www.lifeprint.com/asl101/gifs/d/d.gif",
  e: "https://www.lifeprint.com/asl101/gifs/e/e.gif",
  f: "https://www.lifeprint.com/asl101/gifs/f/f.gif",
  g: "https://www.lifeprint.com/asl101/gifs/g/g.gif",
  h: "https://www.lifeprint.com/asl101/gifs/h/h.gif",
  i: "https://www.lifeprint.com/asl101/gifs/i/i.gif",
  j: "https://www.lifeprint.com/asl101/gifs/j/j.gif",
  k: "https://www.lifeprint.com/asl101/gifs/k/k.gif",
  l: "https://www.lifeprint.com/asl101/gifs/l/l.gif",
  m: "https://www.lifeprint.com/asl101/gifs/m/m.gif",
  n: "https://www.lifeprint.com/asl101/gifs/n/n.gif",
  o: "https://www.lifeprint.com/asl101/gifs/o/o.gif",
  p: "https://www.lifeprint.com/asl101/gifs/p/p.gif",
  q: "https://www.lifeprint.com/asl101/gifs/q/q.gif",
  r: "https://www.lifeprint.com/asl101/gifs/r/r.gif",
  s: "https://www.lifeprint.com/asl101/gifs/s/s.gif",
  t: "https://www.lifeprint.com/asl101/gifs/t/t.gif",
  u: "https://www.lifeprint.com/asl101/gifs/u/u.gif",
  v: "https://www.lifeprint.com/asl101/gifs/v/v.gif",
  w: "https://www.lifeprint.com/asl101/gifs/w/w.gif",
  x: "https://www.lifeprint.com/asl101/gifs/x/x.gif",
  y: "https://www.lifeprint.com/asl101/gifs/y/y.gif",
  z: "https://www.lifeprint.com/asl101/gifs/z/z.gif",
};

export const signDictionary: Record<string, string> = {
  hello: "https://www.lifeprint.com/asl101/gifs/h/hello.gif",
  thank: "https://www.lifeprint.com/asl101/gifs/t/thank-you.gif",
  you: "https://www.lifeprint.com/asl101/gifs/y/you.gif",
  yes: "https://www.lifeprint.com/asl101/gifs/y/yes.gif",
  no: "https://www.lifeprint.com/asl101/gifs/n/no.gif",
  please: "https://www.lifeprint.com/asl101/gifs/p/please.gif",
  sorry: "https://www.lifeprint.com/asl101/gifs/s/sorry.gif",
  help: "https://www.lifeprint.com/asl101/gifs/h/help.gif",
  i: "https://www.lifeprint.com/asl101/gifs/i/i.gif", // Often just point to self, or "I" handshape
  love: "https://www.lifeprint.com/asl101/gifs/l/love.gif",
  how: "https://www.lifeprint.com/asl101/gifs/h/how.gif",
  what: "https://www.lifeprint.com/asl101/gifs/w/what.gif",
  where: "https://www.lifeprint.com/asl101/gifs/w/where.gif",
  who: "https://www.lifeprint.com/asl101/gifs/w/who.gif",
  why: "https://www.lifeprint.com/asl101/gifs/w/why.gif",
  when: "https://www.lifeprint.com/asl101/gifs/w/when.gif",
  good: "https://www.lifeprint.com/asl101/gifs/g/good.gif",
  bad: "https://www.lifeprint.com/asl101/gifs/b/bad.gif",
  more: "https://www.lifeprint.com/asl101/gifs/m/more.gif",
  finish: "https://www.lifeprint.com/asl101/gifs/f/finish.gif",
  done: "https://www.lifeprint.com/asl101/gifs/f/finish.gif",
};

export type SignAction =
  | { type: "sign"; gif: string; word: string }
  | { type: "fingerspell"; letters: string[]; word: string }
  | { type: "none"; word: string };
