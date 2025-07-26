import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// @ts-ignore
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore
import { nord } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface FormattedMessageProps {
  content: string;
}

const FormattedMessage = ({ content }: FormattedMessageProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, className, children, ...props }:(any)) {
          const match = /language-(\w+)/.exec(className || '');
          return match ? (
            <SyntaxHighlighter
              style={nord}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className="px-1 py-0.5 bg-gray-800 rounded text-gray-100" {...props}>
              {children}
            </code>
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-gray-700 border border-gray-700 rounded-lg">
                {children}
              </table>
            </div>
          );
        },
        thead({ children }) {
          return <thead className="bg-gray-800">{children}</thead>;
        },
        tbody({ children }) {
          return <tbody className="divide-y divide-gray-700">{children}</tbody>;
        },
        tr({ children }) {
          return <tr>{children}</tr>;
        },
        th({ children }) {
          return <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{children}</th>;
        },
        td({ children }) {
          return <td className="px-4 py-3 text-sm text-gray-400">{children}</td>;
        },
        a({ children, href }) {
          return (
            <a href={href} className="text-[#C5F631] hover:underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          );
        },
        p({ children }) {
          return <p className="mb-4 last:mb-0 text-gray-200">{children}</p>;
        },
        ul({ children }) {
          return <ul className="list-disc pl-5 my-2 text-gray-200">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal pl-5 my-2 text-gray-200">{children}</ol>;
        },
        li({ children }) {
          return <li className="mb-1 text-gray-200">{children}</li>;
        },
        blockquote({ children }) {
          return <blockquote className="border-l-4 border-[#8EC01D] pl-4 py-1 my-2 italic text-gray-300">{children}</blockquote>;
        },
        h1({ children }) {
          return <h1 className="text-2xl font-bold my-4 text-gray-100">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-xl font-bold my-3 text-gray-100">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-lg font-bold my-2 text-gray-100">{children}</h3>;
        },
        h4({ children }) {
          return <h4 className="text-base font-bold my-2 text-gray-100">{children}</h4>;
        },
        h5({ children }) {
          return <h5 className="text-sm font-bold my-1 text-gray-100">{children}</h5>;
        },
        h6({ children }) {
          return <h6 className="text-xs font-bold my-1 text-gray-100">{children}</h6>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default FormattedMessage; 