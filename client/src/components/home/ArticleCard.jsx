import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { ArrowUpRight } from 'lucide-react';

export default function ArticleCard({ article }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="group relative overflow-hidden rounded-[24px] bg-white transition-all duration-500 hover:shadow-2xl"
      style={{ height: '420px', minWidth: '320px', flex: '0 0 320px' }}
    >
      {/* Image Container */}
      <div className="relative h-2/3 overflow-hidden">
        <img 
          src={article.image} 
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      {/* Content */}
      <div className="p-6">
        <span className="mb-2 inline-block text-[12px] font-bold uppercase tracking-wider text-blue-600">
          {article.category}
        </span>
        <h3 className="mb-2 line-clamp-2 text-[20px] font-bold leading-tight text-[#1d1d1f]">
          {article.title}
        </h3>
        <p className="line-clamp-2 text-sm text-[#86868b]">
          {article.excerpt}
        </p>

        {/* Hover Action */}
        <div className="absolute bottom-6 right-6 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d1d1f] text-white">
            <ArrowUpRight size={20} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
