package com.flowenect.hr.notification.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.flowenect.hr.dto.notification.NotificationDTO;

@Mapper
public interface NotificationMapper {

    int insertNotification(NotificationDTO dto);

    List<NotificationDTO> selectRecentSummary(
            @Param("recvEmpNo") String recvEmpNo,
            @Param("days") int days,
            @Param("limit") int limit);

    List<NotificationDTO> selectNotificationPage(
            @Param("recvEmpNo") String recvEmpNo,
            @Param("months") int months,
            @Param("offset") int offset,
            @Param("limit") int limit);

    int selectNotificationCount(
            @Param("recvEmpNo") String recvEmpNo,
            @Param("months") int months);

    int selectUnreadCount(
            @Param("recvEmpNo") String recvEmpNo,
            @Param("months") int months);

    int markAsRead(@Param("notiNo") Long notiNo, @Param("recvEmpNo") String recvEmpNo);

    int markAllAsRead(@Param("recvEmpNo") String recvEmpNo);

    int deleteOlderThanMonths(@Param("months") int months);

    List<String> selectAllActiveEmpNos();

    // (선택) 디버깅/운영 확인용
    List<Map<String, Object>> selectConnectionHealthSample();
}
