<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24" class="card-box">
        <div>
          <el-form :model="queryParams" ref="queryForm" :inline="true">
          <el-form-item label="消费类型" prop="consumeType">
            <el-select
              v-model="queryParams.consumeType"
              placeholder="方式"
              clearable
              size="small"
              style="width: 120px"
            >
              <el-option
                v-for="dict in consumeTypeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id"
              />
            </el-select>
          </el-form-item>
            <el-form-item label="统计日期">
              <el-date-picker
                v-model="dateRange"
                size="small"
                style="width: 240px"
                value-format="yyyy-MM-dd"
                type="daterange"
                unlink-panels
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="datePickerOptions"
              ></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['report:plan:planReport:stat']">统计</el-button>
              <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
              <el-button type="query" icon="el-icon-camera-solid" size="mini" @click="handleDispatch('Finance')" v-hasPermi="['fund:finance:main']">财务速览</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>

      <el-col :span="16" class="card-box">
        <el-card>
          <div class="chart-wrapper">
            <pie-chart ref="chart" :chartData="chartData"/>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8" class="card-box">
        <el-card>
          <div slot="header">
            <span>消费&预算统计数据</span>
            <span class="link-type" @click="handleDispatch('BudgetLogPeriodStat')">（历史数据<i class="el-icon-s-promotion" />）</span>
          </div>
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
                      <i class="el-icon-info" />当前查询条件统计数据
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><div class="cell">总收入</div></td>
                  <td><div class="cell">{{ formatMoney(statData.totalIncome) }}</div></td>
                  <td>
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('Income')"><i class="el-icon-s-promotion" /></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><div class="cell">总共消费</div></td>
                  <td><div class="cell">{{ formatMoney(statData.totalConsumeAmount) }}</div></td>
                  <td>
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('BuyRecord')"><i class="el-icon-s-promotion" /></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><div class="cell">看病(自费)</div></td>
                  <td><div class="cell">{{ formatMoney(statData.totalTreatAmount) }}</div></td>
                  <td>
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('TreatRecord')"><i class="el-icon-s-promotion" /></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><div class="cell">新增存款</div></td>
                  <td><div class="cell">{{ formatMoney(statData.remainMoney) }}</div></td>
                  <td>
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('Income')"><i class="el-icon-s-promotion" /></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colspan="3">
                    <div class="cell" align="center" style="color: royalblue;">
                      <i class="el-icon-info" />今年统计数据
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><div class="cell">预算金额</div></td>
                  <td><div class="cell">{{ formatMoney(statData.yearBudget) }}</div></td>
                  <td>
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('Budget')"><i class="el-icon-s-promotion" /></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colspan="3">
                    <div class="cell" align="center" style="color: royalblue;">
                      <i class="el-icon-info" />本月统计数据
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><div class="cell">预算金额</div></td>
                  <td><div class="cell">{{ formatMoney(statData.monthBudget) }}</div></td>
                  <td>
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('Budget')"><i class="el-icon-s-promotion" /></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><div class="cell">已经消费</div></td>
                  <td><div class="cell">{{ formatMoney(statData.monthConsumeAmount) }}</div></td>
                  <td>
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('BuyRecord')"><i class="el-icon-s-promotion" /></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><div class="cell">已经过去</div></td>
                  <td>
                    <div class="cell">
                      <el-progress :percentage="statData.dayMonthRate" :color="customColors"></el-progress>
                    </div>
                  </td>
                  <td>
                    <div class="cell">
                      {{statData.monthPassDays+'天'}}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><div class="cell">消费/预算比例</div></td>
                  <td>
                    <div class="cell">
                      <el-progress :percentage="statData.monthConsumeBudgetRate" :color="customColors"></el-progress>
                    </div>
                  </td>
                  <td>
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('BuyRecord')"><i class="el-icon-s-promotion" /></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><div class="cell">还可消费</div></td>
                  <td><div class="cell">{{ formatMoney(statData.monthRemainConsume) }}</div></td>
                  <td>
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('BuyRecord')"><i class="el-icon-s-promotion" /></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><div class="cell">每天还可消费</div></td>
                  <td><div class="cell">{{ formatMoney(statData.monthRCPerDay) }}</div></td>
                  <td>
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('BuyRecord')"><i class="el-icon-s-promotion" /></span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <div slot="header">
            <span>消费统计详情</span>
          </div>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%;">
              <thead>
                <tr>
                  <th class="is-leaf"><div class="cell">名称</div></th>
                  <th class="is-leaf"><div class="cell" align="center">次数</div></th>
                  <th class="is-leaf"><div class="cell" align="center">金额</div></th>
                  <th class="is-leaf" width="60px"><div class="cell" align="center">链接</div></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><div class="cell">消费信息</div></td>
                  <td><div class="cell" align="center">{{ statData.totalBuyCount }}</div></td>
                  <td><div class="cell" align="center">{{ formatMoney(statData.totalConsumeAmount) }}</div></td>
                  <td>
                    <div class="cell" align="center">
                      <span class="link-type" @click="handleDispatch('BuyRecord')"><i class="el-icon-s-promotion" /></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><div class="cell">看病信息</div></td>
                  <td><div class="cell" align="center">{{ statData.totalTreatCount }}</div></td>
                  <td><div class="cell" align="center">{{ formatMoney(statData.totalTreatAmount) }}</div></td>
                  <td>
                    <div class="cell" align="center">
                      <span class="link-type" @click="handleDispatch('TreatRecord')"><i class="el-icon-s-promotion" /></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><div class="cell">其他信息</div></td>
                  <td><div class="cell" align="center">--</div></td>
                  <td><div class="cell" align="center">--</div></td>
                  <td>
                    <div class="cell" align="center">
                      <span class="link-type" @click="handleDispatch('BuyRecord')"><i class="el-icon-s-promotion" /></span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <div slot="header">
            <span>其他统计数据</span>
          </div>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%;">
              <thead>
                <tr>
                  <th class="is-leaf"><div class="cell">名称</div></th>
                  <th class="is-leaf"><div class="cell" align="center">次数</div></th>
                  <th class="is-leaf"><div class="cell" align="center">统计值</div></th>
                  <th class="is-leaf" width="60px"><div class="cell" align="center">链接</div></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><div class="cell">锻炼时间</div></td>
                  <td><div class="cell" align="center">{{ statLifeData.totalSportExerciseCount }}</div></td>
                  <td><div class="cell" align="center">{{ statLifeData.totalSportExerciseHours }}小时</div></td>
                  <td>
                    <div class="cell" align="center">
                      <span class="link-type" @click="handleDispatch('SportExercise')"><i class="el-icon-s-promotion" /></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><div class="cell">音乐练习</div></td>
                  <td><div class="cell" align="center">{{ statLifeData.totalMusicPracticeCount }}</div></td>
                  <td><div class="cell" align="center">{{ statLifeData.totalMusicPracticeHours }}小时</div></td>
                  <td>
                    <div class="cell" align="center">
                      <span class="link-type" @click="handleDispatch('MusicPractice')"><i class="el-icon-s-promotion" /></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><div class="cell">阅读时间</div></td>
                  <td><div class="cell" align="center">{{ statLifeData.totalReadingCount }}</div></td>
                  <td><div class="cell" align="center">{{ statLifeData.totalReadingHours }}小时</div></td>
                  <td>
                    <div class="cell" align="center">
                      <span class="link-type" @click="handleDispatch('ReadingRecord')"><i class="el-icon-s-promotion" /></span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

    </el-row>
  </div>
</template>

<script>
  import {generalStat,generalLifeStat } from "@/api/main";
  import {statWithTreat} from "@/api/consume/buyRecord";
  import {getPercent,progressColors} from "@/utils/mulanbay";
  import PieChart from '../chart/pieChart';
  import resize from './mixins/resize.js'

export default {
  name: "GeneralStat",
  mixins: [resize],
  components: {
    'pie-chart':PieChart
  },
  data() {
    return {
      countUnit:'',
      valueUnit:'',
      // 加载层信息
      loading: [],
      loadingOptions:this.loadingOptions,
      //消费类型
      consumeTypeOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getMonthDateRange(new Date()),
      queryParams:{},
      chartData:{},
      statData:{},
      statLifeData:{},
      //进度百分比颜色
      customColors: progressColors
    };
  },
  created() {
    this.getList();
    this.getEnumTree('GoodsConsumeType','ORDINAL',false).then(response => {
      this.consumeTypeOptions = response;
    });
  },
  methods: {
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 查询服务器信息 */
    getList() {
      let para = this.addDateRange(this.queryParams, this.dateRange);
      this.chartStat(para);
      this.dataStat(para);
      this.lifeDataStat(para);
    },
    // 数据统计
    dataStat(para){
      generalStat(para).then(
        response => {
          this.statData={};
          let data = response;
          let vbuyBudgetRate='--';
          let vmonthConsumeBudgetRate;
          if(data.monthBudget>0){
              vmonthConsumeBudgetRate = getPercent(data.monthConsumeAmount,data.monthBudget);
          }
          //月度剩余
          let vremainMoney = data.totalIncome- data.totalConsumeAmount;
          //本月还可以消费
          let monthRemainConsume = data.monthBudget - data.monthConsumeAmount;
          //本月每天还可以消费
          let monthRCPerDay = monthRemainConsume / data.remainMonthDays ;
          this.statData = {
            monthBudget: data.monthBudget,
            yearBudget: data.yearBudget,
            totalIncome: data.totalIncome,
            totalConsumeAmount: data.totalConsumeAmount,
            totalBuyCount: data.totalBuyCount,
            totalTreatAmount: data.totalTreatAmount,
            totalTreatCount: data.totalTreatCount,
            monthConsumeBudgetRate:parseInt(vmonthConsumeBudgetRate.toFixed(0)),
            remainMoney:vremainMoney,
            dayMonthRate:parseInt(data.dayMonthRate.toFixed(0)),
            remainMonthDays:data.remainMonthDays,
            monthConsumeAmount:data.monthConsumeAmount,
            monthDays:data.monthDays,
            monthPassDays:data.monthPassDays,
            monthRemainConsume:monthRemainConsume,
            monthRCPerDay:monthRCPerDay
          };
        }
      );
    },
    // 数据统计
    lifeDataStat(para){
      generalLifeStat(para).then(
        response => {
          this.statLifeData={};
          let data = response;
          this.statLifeData = {
            totalSportExerciseHours: data.totalSportExerciseHours.toFixed(1),
            totalSportExerciseCount: data.totalSportExerciseCount,
            totalReadingHours: data.totalReadingHours.toFixed(1),
            totalReadingCount: data.totalReadingCount,
            totalMusicPracticeHours:data.totalMusicPracticeHours.toFixed(1),
            totalMusicPracticeCount:data.totalMusicPracticeCount,
          };
        }
      );
    },
    // 图表统计
    chartStat(para){
      this.openLoading();
      statWithTreat(para).then(
        response => {
          //组装chart数据
          response.height = '700px';
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
