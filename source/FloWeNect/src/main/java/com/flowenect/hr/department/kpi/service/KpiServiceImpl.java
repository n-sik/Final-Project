package com.flowenect.hr.department.kpi.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.flowenect.hr.department.kpi.mapper.KpiMapper;
import com.flowenect.hr.dto.kpi.KpiDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class KpiServiceImpl implements KpiService {


    private final KpiMapper kpiMapper;

    @Override
    public List<KpiDTO> getKpiListByProj(Long projNo) {
        return kpiMapper.selectKpiListByProj(projNo);
    }

    @Override
    public KpiDTO getKpiDetail(Long kpiNo) {
        return kpiMapper.selectKpiDetail(kpiNo);
    }

    @Override
    public int registerKpi(KpiDTO kpiDto) {
        return kpiMapper.insertKpi(kpiDto);
    }

    @Override
    public int modifyKpi(KpiDTO kpiDto) {
        return kpiMapper.updateKpi(kpiDto);
    }

    @Override
    public int removeKpi(Long kpiNo) {
        return kpiMapper.deleteKpi(kpiNo);
    }

    @Override
    public List<KpiDTO> getSubKpiListByParent(Long parentNo) {
        return kpiMapper.getSubKpiListByParent(parentNo);
    }
}
