import header from './header.ejs';
import footer from './footer.ejs';
import html from './layout.ejs';

export function htmlEjs(content) {
  content = content.replace(/module\.exports\s*=/, 'return');
  return new Function('', content)();
}

export default function layout(data) {
  return htmlEjs(html)({
    header: htmlEjs(header)(data),
    footer: htmlEjs(footer)(data),
    content: data.content,
    title: data.title
  });
}
