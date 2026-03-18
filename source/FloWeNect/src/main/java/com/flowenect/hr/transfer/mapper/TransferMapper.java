package com.flowenect.hr.transfer.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.flowenect.hr.dto.transfer.TransferApproveDTO;
import com.flowenect.hr.dto.transfer.TransferDTO;

@Mapper
public interface TransferMapper {

	List<TransferDTO> selectTransferList(TransferDTO param);
	int selectTransferCount(TransferDTO param);
	TransferDTO selectTransferDetail(String aprvNo);
	
    int updateAprvDocStatus(TransferApproveDTO param);
    int updateAprvDocStatusBulk(TransferApproveDTO param);
    int updateEmpDept(TransferDTO transfer);
    List<TransferDTO> selectTransferDetailsByAprvNos(List<String> aprvNos);
}
