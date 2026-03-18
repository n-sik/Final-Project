package com.flowenect.hr.dto.notification;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "notiNo")
@ToString
public class NotificationDTO {

    private Long notiNo;
    private String recvEmpNo;
    private String notiTypeCd;
    private String notiCn;
    private String srcTypeCd;
    private String srcNo;
    private String moveUrl;
    private String readYn;
    private LocalDateTime regDtm;

}
