import Link from 'next/link';

export default function CourseCard({ course }) {
  return (
    <Link href={`/courses/${course._id}`} className="group block">
      <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
        <div className="relative h-52 overflow-hidden bg-stone-100">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-semibold text-stone-800 shadow-sm border border-stone-100">
            {course.category}
          </div>
        </div>
        <div className="p-6 flex flex-col flex-1">
          <h3 className="font-bold text-xl mb-2 line-clamp-2 text-stone-900 group-hover:text-amber-800 transition-colors tracking-tight">
            {course.title}
          </h3>
          <p className="text-stone-600 mb-4 line-clamp-2 text-sm flex-1">
            {course.description}
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-stone-200/60 mt-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-[#F9F3E7] text-sm font-bold shadow-md">
                {course.tutorName.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold text-stone-900">{course.tutorName}</div>
                <div className="text-xs text-stone-500">Expert Instructor</div>
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-800">${course.price}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}