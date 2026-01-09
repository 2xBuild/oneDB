import type { Comment } from "@onedb/types";

// Builds nested comment tree from flat array; comments with parentId nest under parent's replies
export function buildCommentTree(comments: Comment[]): Comment[] {
  if (!comments || comments.length === 0) {
    return [];
  }

  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  // First pass: creating map of all comments with empty replies array
  comments.forEach((comment) => {
    commentMap.set(comment.id, { 
      ...comment, 
      replies: [] 
    });
  });

  // Second pass: building tree structure
  comments.forEach((comment) => {
    const commentNode = commentMap.get(comment.id);
    if (!commentNode) return;

    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(commentNode);
      } else {
        // Parent not found, treating as root comment (orphaned reply)
        rootComments.push(commentNode);
      }
    } else {
      rootComments.push(commentNode);
    }
  });

  // Sorting replies by creation date
  const sortComments = (comments: Comment[]): Comment[] => {
    return comments.map(comment => {
      const sortedComment = {
        ...comment,
        replies: comment.replies && comment.replies.length > 0
          ? sortComments(comment.replies).sort((a, b) => {
              const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt;
              const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt;
              return dateA.getTime() - dateB.getTime();
            })
          : []
      };
      // Preserving author info
      if (!sortedComment.author && comment.author) {
        sortedComment.author = comment.author;
      }
      return sortedComment;
    }).sort((a, b) => {
      const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt;
      const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt;
      return dateA.getTime() - dateB.getTime();
    });
  };

  return sortComments(rootComments);
}

// Counts total comments including all nested replies
export function countAllComments(comments: Comment[]): number {
  if (!comments || comments.length === 0) {
    return 0;
  }

  return comments.reduce((total, comment) => {
    const repliesCount = comment.replies && comment.replies.length > 0
      ? countAllComments(comment.replies)
      : 0;
    return total + 1 + repliesCount;
  }, 0);
}




