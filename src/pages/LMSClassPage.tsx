import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Lock, CheckCircle, ChevronLeft, ChevronRight,
  FileText, Download, Clock, Award, List, X, Eye
} from 'lucide-react';
import Header from '../components/layout/Header';
import api from '../services/api';
import toast from 'react-hot-toast';

interface ClassData {
  class: {
    _id: string;
    title: string;
    description?: string;
    videoUrl: string;
    videoId: string;
    duration?: number;
    section: string;
    order: number;
    isLocked: boolean;
    pdfAttachment?: {
      url: string;
      filename: string;
    };
    course: {
      _id: string;
      title: string;
      certificateEnabled: boolean;
    };
  };
  progress: {
    _id: string;
    watchProgress: number;
    lastPosition: number;
    status: string;
  };
  enrollment: {
    _id: string;
    progress: {
      completedClasses: number;
      totalClasses: number;
      percentage: number;
    };
  };
  allClasses: Array<{
    _id: string;
    title: string;
    section: string;
    order: number;
    isLocked: boolean;
  }>;
  progressMap: Record<string, { status: string; watchProgress: number }>;
}

const LMSClassPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const playerRef = useRef<any>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [_isPlayerReady, setIsPlayerReady] = useState(false);

  // Fetch class data
  const { data, isLoading, error } = useQuery({
    queryKey: ['watch-class', classId],
    queryFn: async () => {
      const res = await api.get(`/lms/watch/${classId}`);
      return res.data.data as ClassData;
    },
    retry: false
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (progressData: { watchProgress: number; lastPosition: number }) => {
      const res = await api.put(`/lms/progress/${classId}`, progressData);
      return res.data;
    },
    onSuccess: (data) => {
      // If marked as completed, invalidate queries to refresh UI
      if (data?.completed) {
        queryClient.invalidateQueries({ queryKey: ['watch-class', classId] });
      }
    },
    onError: (error: any) => {
      console.error('Progress update error:', error);
    }
  });

  // Generate certificate mutation
  const generateCertificateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/lms/certificates/generate', {
        courseId: data?.class.course._id
      });
      return res.data;
    },
    onSuccess: (response) => {
      toast.success('Certificate generated!');
      queryClient.invalidateQueries({ queryKey: ['watch-class'] });
      navigate(`/lms/certificate/${response.data._id}`);
    }
  });

  // Initialize YouTube Player
  useEffect(() => {
    if (!data?.class.videoId) return;

    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Create player when API is ready
    (window as any).onYouTubeIframeAPIReady = () => {
      playerRef.current = new (window as any).YT.Player('youtube-player', {
        videoId: data.class.videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          start: Math.floor(data.progress?.lastPosition || 0)
        },
        events: {
          onReady: () => setIsPlayerReady(true),
          onStateChange: handlePlayerStateChange
        }
      });
    };

    // If API already loaded
    if ((window as any).YT && (window as any).YT.Player) {
      (window as any).onYouTubeIframeAPIReady();
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [data?.class.videoId]);

  const handlePlayerStateChange = (event: any) => {
    // Playing
    if (event.data === 1) {
      // Start progress tracking
      progressInterval.current = setInterval(() => {
        if (playerRef.current) {
          const currentTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          const watchProgress = Math.min(100, (currentTime / duration) * 100);

          updateProgressMutation.mutate({
            watchProgress,
            lastPosition: currentTime
          });
        }
      }, 30000); // Update every 30 seconds
    } else {
      // Paused or ended
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }

      // Save current progress
      if (playerRef.current) {
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        const watchProgress = Math.min(100, (currentTime / duration) * 100);

        updateProgressMutation.mutate({
          watchProgress,
          lastPosition: currentTime
        });
      }
    }

    // Video ended
    if (event.data === 0) {
      updateProgressMutation.mutate({
        watchProgress: 100,
        lastPosition: 0
      });
      queryClient.invalidateQueries({ queryKey: ['watch-class'] });
    }
  };

  // Navigate to next/prev class
  const navigateToClass = (direction: 'next' | 'prev') => {
    if (!data?.allClasses) return;

    const currentIndex = data.allClasses.findIndex(c => c._id === classId);
    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (targetIndex >= 0 && targetIndex < data.allClasses.length) {
      const targetClass = data.allClasses[targetIndex];
      if (!targetClass.isLocked) {
        navigate(`/lms/watch/${targetClass._id}`);
      } else {
        toast.error('This class is locked');
      }
    }
  };

  // Check if course completed
  const isCourseCompleted = data?.enrollment.progress.percentage === 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (error) {
    const errorMessage = (error as any)?.response?.data?.message || 'Error loading class';
    const isBlocked = (error as any)?.response?.data?.blocked;
    const isLocked = (error as any)?.response?.data?.locked;

    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white p-8 bg-gray-800 rounded-2xl max-w-md">
          {isBlocked ? (
            <>
              <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Access Blocked</h2>
              <p className="text-gray-400">{errorMessage}</p>
              <p className="text-sm text-red-400 mt-2">
                {(error as any)?.response?.data?.reason}
              </p>
            </>
          ) : isLocked ? (
            <>
              <Lock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Class Locked</h2>
              <p className="text-gray-400">{errorMessage}</p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-2">Error</h2>
              <p className="text-gray-400">{errorMessage}</p>
            </>
          )}
          <Link
            to="/lms"
            className="inline-block mt-6 px-6 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700 transition"
          >
            Back to My Courses
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const currentIndex = data.allClasses.findIndex(c => c._id === classId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < data.allClasses.length - 1;

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <div className="pt-16 flex">
        {/* Sidebar Toggle (Mobile) */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="fixed bottom-4 right-4 z-50 lg:hidden p-3 bg-emerald-600 text-white rounded-full shadow-lg"
        >
          {showSidebar ? <X className="w-6 h-6" /> : <List className="w-6 h-6" />}
        </button>

        {/* Sidebar - Class List */}
        <div className={`fixed lg:relative inset-y-0 left-0 z-40 w-80 bg-gray-800 transform transition-transform duration-300 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden'
        }`}>
          <div className="h-screen pt-16 overflow-y-auto">
            {/* Course Progress */}
            <div className="p-4 border-b border-gray-700">
              <Link
                to={`/lms/course/${data.class.course._id}`}
                className="text-sm text-emerald-400 hover:underline flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Course
              </Link>
              <h2 className="text-white font-semibold mt-2 line-clamp-2">
                {data.class.course.title}
              </h2>
              <div className="mt-3">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{data.enrollment.progress.percentage}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${data.enrollment.progress.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Classes List */}
            <div className="p-2">
              {data.allClasses.map((classItem, index) => {
                const progress = data.progressMap[classItem._id];
                const isCurrent = classItem._id === classId;
                const isCompleted = progress?.status === 'completed';

                return (
                  <div
                    key={classItem._id}
                    onClick={() => {
                      if (!classItem.isLocked) {
                        navigate(`/lms/watch/${classItem._id}`);
                      }
                    }}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                      isCurrent
                        ? 'bg-emerald-600/20 border border-emerald-500/50'
                        : classItem.isLocked
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    {/* Status Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-emerald-500'
                        : classItem.isLocked
                        ? 'bg-gray-600'
                        : 'bg-gray-700'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : classItem.isLocked ? (
                        <Lock className="w-4 h-4 text-gray-400" />
                      ) : (
                        <span className="text-sm text-gray-300">{index + 1}</span>
                      )}
                    </div>

                    {/* Class Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${
                        isCurrent ? 'text-emerald-400 font-medium' : 'text-gray-300'
                      }`}>
                        {classItem.title}
                      </p>
                      {classItem.section && (
                        <p className="text-xs text-gray-500 truncate">{classItem.section}</p>
                      )}
                    </div>

                    {/* Progress */}
                    {progress?.watchProgress > 0 && progress.status !== 'completed' && (
                      <div className="text-xs text-emerald-400">
                        {Math.round(progress.watchProgress)}%
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Certificate Button */}
            {isCourseCompleted && data.class.course.certificateEnabled && (
              <div className="p-4 border-t border-gray-700">
                <button
                  onClick={() => generateCertificateMutation.mutate()}
                  disabled={generateCertificateMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-medium"
                >
                  <Award className="w-5 h-5" />
                  {generateCertificateMutation.isPending ? 'Generating...' : 'Get Certificate'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-screen">
          {/* Video Player */}
          <div className="aspect-video bg-black">
            <div id="youtube-player" className="w-full h-full" />
          </div>

          {/* Class Info */}
          <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigateToClass('prev')}
                disabled={!hasPrev}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  hasPrev
                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                    : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
              <button
                onClick={() => navigateToClass('next')}
                disabled={!hasNext}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  hasNext
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Title */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-emerald-400 text-sm mb-2">
                {data.class.section && <span>{data.class.section}</span>}
                <span>•</span>
                <span>Class {currentIndex + 1} of {data.allClasses.length}</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                {data.class.title}
              </h1>
            </div>

            {/* Progress Bar */}
            <div className="mb-6 p-4 bg-gray-800 rounded-xl">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Your progress
                </span>
                <span className={data.progress.status === 'completed' ? 'text-emerald-400' : ''}>
                  {data.progress.status === 'completed' ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Completed
                    </span>
                  ) : (
                    `${Math.round(data.progress.watchProgress)}% watched`
                  )}
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${data.progress.watchProgress}%` }}
                />
              </div>
            </div>

            {/* PDF Attachment */}
            {data.class.pdfAttachment && (
              <div className="mb-6 p-4 bg-gray-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <FileText className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{data.class.pdfAttachment.filename}</p>
                    <p className="text-sm text-gray-400">PDF Notes & Resources</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={data.class.pdfAttachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </a>
                    <a
                      href={data.class.pdfAttachment.url}
                      download={data.class.pdfAttachment.filename}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {data.class.description && (
              <div className="prose prose-invert max-w-none">
                <h3 className="text-lg font-semibold text-white mb-3">About this class</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {data.class.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LMSClassPage;
