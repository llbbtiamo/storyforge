package com.storyforge.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.storyforge.domain.dto.ChapterCreateRequest;
import com.storyforge.domain.dto.ChapterUpdateRequest;
import com.storyforge.domain.entity.Chapter;
import com.storyforge.domain.vo.ChapterVO;
import com.storyforge.domain.vo.ChapterVersionVO;

import java.util.List;

public interface IChapterService extends IService<Chapter> {

    List<ChapterVO> listChapters(Long userId, Long projectId);

    ChapterVO getChapter(Long userId, Long projectId, Long chapterId);

    ChapterVO createChapter(Long userId, Long projectId, ChapterCreateRequest request);

    ChapterVO updateChapter(Long userId, Long projectId, Long chapterId, ChapterUpdateRequest request);

    ChapterVO approveChapter(Long userId, Long projectId, Long chapterId);

    List<ChapterVersionVO> listChapterVersions(Long userId, Long projectId, Long chapterId);

    boolean deleteChapter(Long userId, Long projectId, Long chapterId);
}
