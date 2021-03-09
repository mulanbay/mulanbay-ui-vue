<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24" class="card-box">
        <div>
          <el-form :model="queryParams" ref="queryForm" :inline="true">
            <el-form-item label="预算周期" prop="period">
              <el-radio-group v-model="queryParams.period">
                <el-radio
                  v-for="dict in periodOptions"
                  :key="dict.id"
                  :label="dict.id"
                >{{dict.text}}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="queryParams.period == 'YEARLY'" label="选择年份">
              <el-date-picker
                v-model="queryParams.year"
                type="year"
                value-format="yyyy"
                style="width: 120px"
                placeholder="选择年份">
              </el-date-picker>
            </el-form-item>
            <el-form-item v-if="queryParams.period == 'MONTHLY'" label="选择月份">
              <el-date-picker
                v-model="queryParams.yearMonth"
                type="month"
                value-format="yyyy-MM"
                style="width: 120px"
                placeholder="选择月份">
              </el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['fund:budgetLog:periodStat']">统计</el-button>
              <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
              <el-button type="primary" icon="el-icon-d-arrow-left" size="mini" @click="getNext(-1)" v-hasPermi="['fund:budgetLog:periodStat']">往前</el-button>
              <el-button type="primary" icon="el-icon-d-arrow-right" size="mini" @click="getNext(1)" v-hasPermi="['fund:budgetLog:periodStat']">往后</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>

      <el-col :span="16" class="card-box">
        <el-card>
          <div class="chart-wrapper">
            <pie-chart ref="chart" :chartData="chartData"/>
          </div>
          <div align="center">
            <el-button type="stat" icon="el-icon-s-data" size="mini" @click="consumeChartStat" >消费分析</el-button>
            <el-button type="stat" icon="el-icon-s-data" size="mini" @click="incomeChartStat" >收入分析</el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8" class="card-box">
        <el-card>
          <div slot="header"><span>{{ statData.bussKey }}消费&预算统计数据</span></div>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%;">
              <thead>
                <tr>
                  <th class="is-leaf"><div class="cell">名称</div></th>
                  <th class="is-leaf"><div class="cell">统计值</div></th>
                  <th class="is-leaf" width="60px"><div class="cell">链接</div></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="3">
                    <div class="cell" align="center" style="color: royalblue;">
                      <i class="el-icon-info" />统计数据
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><div class="cell">预算金额</div></td>
                  <td><div class="cell">{{ formatMoney(statData.budgetAmount) }}</div></td>
                  <td>
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('Budget')"><i class="el-icon-s-promotion" /></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><div class="cell">普通消费</div></td>
                  <td><div class="cell">{{ formatMoney(statData.ncAmount) }}</div></td>
                  <td>
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('BuyRecord')"><i class="el-icon-s-promotion" /></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><div class="cell">突发消费</div></td>
                  <td><div class="cell">{{ formatMoney(statData.bcAmount) }}</div></td>
                  <td>
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('BuyRecord')"><i class="el-icon-s-promotion" /></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><div class="cell">看病(自费)</div></td>
                  <td><div class="cell">{{ formatMoney(statData.trAmount) }}</div></td>
                  <td>
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('TreatRecord')"><i class="el-icon-s-promotion" /></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><div class="cell">收入统计</div></td>
                  <td><div class="cell">{{ formatMoney(statData.incomeAmount) }}</div></td>
                  <td>
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('Income')"><i class="el-icon-s-promotion" /></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><div class="cell">总共消费</div></td>
                  <td><div class="cell">{{ formatMoney(statData.totalConsume) }}</div></td>
                  <td>
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('BuyRecord')"><i class="el-icon-s-promotion" /></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colspan="3">
                    <div class="cell" align="center" style="color: royalblue;">
                      <i class="el-icon-info" />数据比较
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="cell">
                      预算/消费比例
                    </div>
                  </td>
                  <td>
                    <div class="cell">
                      <el-progress :percentage="statData.monthConsumeBudgetRate" :color="customColors"></el-progress>
                    </div>
                    <td>
                      <div class="cell">
                        <span class="link-type" @click="handleDispatch('BuyRecord')"><i class="el-icon-s-promotion" /></span>
                      </div>
                    </td>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="cell">
                      <span v-if="statData.totalConsume>statData.budgetAmount" style="color: red;">
                       超出预算
                       <span class="link-type" @click="msgAlert('提示','总消费金额大于预算金额')"><i class="el-icon-question" /></span>
                      </span>
                      <span v-else style="color: green;">
                       低于预算
                       <span class="link-type" @click="msgAlert('提示','总消费金额低于预算金额')"><i class="el-icon-question" /></span>
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="cell">
                      {{ formatMoney(statData.cb) }}
                    </div>
                    <td>
                      <div class="cell">
                        <span class="link-type" @click="handleDispatch('BuyRecord')"><i class="el-icon-s-promotion" /></span>
                      </div>
                    </td>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="cell">
                      <span v-if="statData.totalConsume>statData.incomeAmount" style="color: red;">
                       存款减少
                       <span class="link-type" @click="msgAlert('提示','存款值=收入-总消费金额')"><i class="el-icon-question" /></span>
                      </span>
                      <span v-else style="color: green;">
                       存款增加
                       <span class="link-type" @click="msgAlert('提示','存款值=收入-总消费金额')"><i class="el-icon-question" /></span>
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="cell">
                      {{ formatMoney(statData.ib) }}
                    </div>
                    <td>
                      <div class="cell">
                        <span class="link-type" @click="handleDispatch('Income')"><i class="el-icon-s-promotion" /></span>
                      </div>
                    </td>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="cell">
                      <span v-if="statData.accountChangeAmount==null">
                        账户变化
                      </span>
                      <span v-else-if="statData.accountChangeAmount<0" style="color: red;">
                        账户减少
                      </span>
                      <span v-else style="color: green;">
                        账户增加
                      </span>
                      <span class="link-type" @click="msgAlert('提示','账户管理页面中的账户总值变化')"><i class="el-icon-question" /></span>
                    </div>
                  </td>
                  <td><div class="cell">{{ formatMoney(Math.abs(statData.accountChangeAmount)) }}</div></td>
                  <td>
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('Account')"><i class="el-icon-s-promotion" /></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="cell">
                      账户/存款差率
                      <span class="link-type" @click="msgAlert('提示','差率=(账户变化值-存款变化值)/存款变化值，代表着账户里的银行卡余额变化和系统的消费、收入统计数据之间的差值，数字越小说明越精确')"><i class="el-icon-question" /></span>
                    </div>
                  </td>
                  <td>
                    <div class="cell">
                      {{ statData.aiv }}
                    </div>
                    <td>
                      <div class="cell">
                        <span class="link-type" @click="handleDispatch('BudgetLog/valueErrorStat')"><i class="el-icon-s-promotion" /></span>
                      </div>
                    </td>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="24" class="card-box">
        <el-card>
          <div slot="header">
            <span>{{ statData.bussKey }}预算快照信息</span>
          </div>
          <snapshot :budgetData="budgetData"/>
        </el-card>
      </el-col>

    </el-row>
  </div>
</template>

<script>
  import {getBudgetLogPeriodStat} from "@/api/fund/budgetLog";
  import {statWithTreat} from "@/api/consume/buyRecord";
  import {getIncomeStat} from "@/api/fund/income";
  import {getPercent,progressColors} from "@/utils/mulanbay";
  import {getDay,getMonth} from "@/utils/datetime";
  import PieChart from '../../chart/pieChart';
  import Snapshot from '../budgetSnapshot/snapshot';
  import resize from '../../dashboard/mixins/resize.js';
  import {copyObject,getQueryObject} from "@/utils/index";

export default {
  name: "BudgetLogPeriodStat",
  mixins: [resize],
  components: {
    'pie-chart':PieChart,
    'snapshot':Snapshot
  },
  data() {
    return {
      // 加载层信息
      loading: [],
      loadingOptions:this.loadingOptions,
      //周期表
      periodOptions:[
        {
          id: 'YEARLY',
          text: '年'
        },
        {
          id: 'MONTHLY',
          text: '月'
        }
      ],
      queryParams:{
        period:undefined,
        year:undefined,
        yearMonth:undefined
      },
      chartData:{},
      statData:{},
      //预算快照
      budgetData: {
        budgetLogId: undefined
      },
      //进度百分比颜色
      customColors: progressColors
    };
  },
  created() {
    let qb = getQueryObject(null);
    if(!this.isObjectEmpty(qb.date)){
      if(qb.date.length==4){
        //年
        this.queryParams.period = 'YEARLY';
        this.queryParams.year = qb.date;
      }else{
        //月
        this.queryParams.period = 'MONTHLY';
        this.queryParams.yearMonth = qb.date;
      }
    }else{
        //默认月
        this.queryParams.period = 'MONTHLY';
        const day = getDay(0);
        //默认取上一个月
        const md = getMonth(-1,day);
        this.queryParams.yearMonth = md.substring(0,7);
    }
    this.getList();
  },
  methods: {
    //跳转
    handleDispatch(pathName){
      //路由定向
      this.$router.push({name:pathName,query: {}})
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 计算运营日 */
    getDateRange(){
      let ds = undefined;
      if(this.queryParams.period=='YEARLY'){
        ds = this.getYearDateRange(this.queryParams.year);
      }else{
        const date = this.queryParams.yearMonth+'-01';
        ds = this.getMonthDateRange(new Date(date.replace(/-/,"/")));
      }
      return {startDate:ds[0],endDate:ds[1]};
    },
    /** 往前往后 */
    getNext(n){
      const period = this.queryParams.period;
      if(period=='YEARLY'){
        this.queryParams.year = (parseInt(this.queryParams.year)+n)+'';
      }else{
        const date = this.queryParams.yearMonth+'-01';
        let m = getMonth(n,date);
        this.queryParams.yearMonth = m.substring(0,7);
      }
      this.getList();
    },
    /** 统计 */
    getList() {
      this.dataStat();
    },
    // 数据统计
    dataStat(){
      const period = this.queryParams.period;
      let para = {bussKey:undefined};
      if(period=='YEARLY'){
        para.bussKey = this.queryParams.year;
      }else{
        para.bussKey = this.queryParams.yearMonth.replace('-','');
      }
      getBudgetLogPeriodStat(para).then(
        response => {
          if(response==null){
            this.msgError('没有相关数据');
            return;
          }
          this.statData = response;
          this.statData.totalConsume = response.ncAmount+response.bcAmount+response.trAmount;
          //预算和消费差值
          let aa = response.budgetAmount-this.statData.totalConsume;
          this.statData.cb = Math.abs(aa);
          //收入与消费差值
          let bb = response.incomeAmount-this.statData.totalConsume;
          this.statData.ib = Math.abs(bb);
          //账户/存款差率
          if(bb==0||response.accountChangeAmount==null){
            this.statData.aiv = null;
          }else{
            let aiv = getPercent(response.accountChangeAmount-bb,this.statData.ib);
            this.statData.aiv =aiv+'%';
          }
          //消费/预算比例
          let monthConsumeBudgetRate = getPercent(this.statData.totalConsume,this.statData.budgetAmount);
          this.statData.monthConsumeBudgetRate = parseInt(monthConsumeBudgetRate.toFixed(0));
          //统计
          this.consumeChartStat();
          //预算快照
          this.budgetSnapshotList(response.id);
        }
      );
    },
    // 预算快照列表
    budgetSnapshotList(budgetLogId){
      this.budgetData = Object.assign({}, this.budgetData, {
        budgetLogId: budgetLogId
      });
    },
    // 消费图表统计
    consumeChartStat(){
      let para = this.getDateRange();
      this.openLoading();
      statWithTreat(para).then(
        response => {
          //组装chart数据
          response.chartType='PIE';
          response.height = '630px';
          this.chartData = response;
          this.loading.close();
        }
      );
    },
    // 收入图表统计
    incomeChartStat(){
      let para = this.getDateRange();
      this.openLoading();
      getIncomeStat(para).then(
        response => {
          //组装chart数据
          response.chartType='PIE';
          response.height = '630px';
          this.chartData = response;
          this.loading.close();
        }
      );
    },
    // 打开加载层
    openLoading() {
      this.loading = this.$loading(this.loadingOptions);
    }
  }
};
</script>
