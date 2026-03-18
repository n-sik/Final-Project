package com.flowenect.hr.notification.service;

import java.util.List;

import com.flowenect.hr.dto.notification.NotificationDTO;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationPage {
    private final List<NotificationDTO> list;
    private final int totalCount;
    private final int page;
    private final int size;
}
