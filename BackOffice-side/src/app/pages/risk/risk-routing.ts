import { Routes } from '@angular/router';
import { MonitorComponent } from 'src/app/pages/risk/monitor/monitor.component';
import { MonitorDetailComponent } from 'src/app/pages/risk/monitor/monitor-detail/monitor-detail.component';
import { AuditLogComponent } from 'src/app/pages/risk/audit-log/audit-log.component';
import { RuleConfigurationComponent } from './ruleConfiguration/ruleConfiguration.component';
import { ConfigurationComponent } from './ruleConfiguration/configuration/configuration.component';
import { IntegralComponent } from './ruleConfiguration/integral/integral.component';
import { GradeComponent } from './ruleConfiguration/grade/grade.component';
import { PendingToUploadComponent } from 'src/app/pages/risk/pending-to-upload/pending-to-upload.component';
import { FundFlowAnalysisComponent } from 'src/app/pages/risk/fund-flow-analysis/fund-flow-analysis.component';
import { IpMonitoringComponent } from './ip-monitoring/ip-monitoring.component';
import { IpMonitoringQueryComponent } from './ip-monitoring/query/query.component';
import { topWinnerRoutes } from 'src/app/pages/risk/top-winner/top-winner-routing';
import { RiskLevelCongfiguraionComponent } from './ruleConfiguration/risk-level-congfiguraion/risk-level-congfiguraion.component';
import { batchRoutes } from 'src/app/pages/risk/batch/batch-routing';
import { BadDataComponent } from 'src/app/pages/risk/bad-data/bad-data.component';
import { BadDataDetailComponent } from 'src/app/pages/risk/bad-data/detail/detail.component';
import { DeviceFingerprintComponent } from 'src/app/pages/risk/device-fingerprint/device-fingerprint.component';

export const routes: Routes = [
  { path: '', redirectTo: '/risk/monitor', pathMatch: 'full' },
  {
    path: 'monitor',
    component: MonitorComponent,
    data: { name: '实时监控列表', showMerchant: true, code: '267', lang: 'nav.realMonitoList' },
  },
  {
    path: 'monitor/detail',
    component: MonitorDetailComponent,
    data: {
      name: '实时监控详情',
      showMerchant: true,
      code: '267',
      lang: 'breadCrumb.realMonitoringDetails',
      breadcrumbsBefore: [{ name: '实时监控列表', link: '/risk/monitor', lang: 'nav.realMonitoList' }],
    },
  },
  {
    path: 'audit',
    component: AuditLogComponent,
    data: { name: '自动审核记录', showMerchant: true, code: '269', lang: 'nav.autoAuditTrail' },
  },
  {
    path: 'ruleConfiguration',
    component: RuleConfigurationComponent,
    data: { name: '风控规则配置', code: '305', lang: 'nav.riskRuleConfig' },
    children: [
      { path: '', redirectTo: 'configuration', pathMatch: 'full' },
      {
        path: 'configuration',
        component: ConfigurationComponent,
        data: { name: '风控规则配置', lang: 'nav.riskRuleConfig' },
      },
      {
        path: 'integral',
        component: IntegralComponent,
        data: { name: '信用积分配置', lang: 'breadCrumb.creditScoreConfiguration' },
      },
      {
        path: 'grade',
        component: GradeComponent,
        data: { name: '信用等级配置', lang: 'breadCrumb.creditRatingConfiguration' },
      },
      {
        path: 'risk-level',
        component: RiskLevelCongfiguraionComponent,
        data: { name: '风控级别配置', lang: 'breadCrumb.riskLevelConfiguration', showMerchant: true },
      },
    ],
  },
  {
    path: 'pending-to-upload',
    component: PendingToUploadComponent,
    data: { name: '待补充列表', showMerchant: true, code: '320', lang: 'nav.pendingToUploadList' },
  },
  {
    path: 'fund-flow-analysis',
    component: FundFlowAnalysisComponent,
    data: { name: '资金流向分析', showMerchant: true, code: '323', lang: 'nav.fundFlowAnalysis' },
  },
  {
    path: 'device-fingerprint',
    component: DeviceFingerprintComponent,
    data: { name: '设备指纹', showMerchant: true, code: '330', lang: 'nav.deviceFingerprint' },
  },
  {
    path: 'ip-monitoring',
    component: IpMonitoringComponent,
    data: { name: 'IP监控', showMerchant: true, code: '322', lang: 'nav.ipMonitoring' },
  },
  {
    path: 'ip-monitoring-query',
    component: IpMonitoringQueryComponent,
    data: {
      name: 'IP监控详情',
      lang: 'nav.ipMonitoringDetial',
      breadcrumbsBefore: [{ name: 'IP监控', link: '/risk/ip-monitoring', lang: 'nav.ipMonitoring' }],
    },
  },
  {
    path: 'bad-data',
    component: BadDataComponent,
    data: { name: '不良数据', showMerchant: true, code: '10014', lang: 'nav.badData' },
  },
  {
    path: 'bad-data-detail',
    component: BadDataDetailComponent,
    data: {
      name: '不良数据详情',
      lang: 'nav.badDataDetail',
      breadcrumbsBefore: [{ name: '不良数据', link: '/risk/bad-data', lang: 'nav.badData' }],
    },
  },
  ...topWinnerRoutes,
  ...batchRoutes,
];
