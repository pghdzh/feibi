import http from "../axios";

/**
 * @function 查询图片列表（分页 + 排序 + 筛选）
 * @param {object} options
 * @param {number} options.page           - 当前页，默认 1
 * @param {number} options.limit          - 每页数量，默认 10
 * @param {string} [options.sortBy]       - 排序字段：uploaded_at 或 like_count
 * @param {string} [options.order]        - 排序方式：asc / desc
 * @param {string} [options.character_key] - 可选，角色 key
 * @returns {Promise<any>}
 */
export const getImagesLikesList = (options): Promise<any> => {
  return http.get("/api/getImagesLikes", options);
};

/**
 * @function 点赞接口
 * @param {number} id - 图片 ID
 * @returns {Promise<any>}
 */
export const likeImage = (id: number): Promise<any> => {
  if (!id) return Promise.reject(new Error("ID 不能为空"));
  return http.post(`/api/like/${id}`);
};

export const getImagesByIds = (data): Promise<any> => {
  // 确保ids是逗号分隔的字符串
  let idsStr = '';
  if (Array.isArray(data.ids)) {
    idsStr = data.ids.join(',');
  } else if (data.ids) {
    // 如果已经是字符串，直接使用
    idsStr = data.ids;
  }
  
  // 手动构建URL，避免axios参数序列化问题
  const queryParams = new URLSearchParams();
  if (idsStr) {
    queryParams.append('ids', idsStr);
  }
  queryParams.append('character_key', data.character_key || 'feibi');
  
  const queryString = queryParams.toString();
  const url = `/api/getImagesByIds${queryString ? '?' + queryString : ''}`;
  
  return http.get(url);
};