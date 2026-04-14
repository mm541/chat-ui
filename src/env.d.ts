// Allow TypeScript to safely resolve raw CSS imports
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
