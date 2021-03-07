<template>
  <div class="app-container">
    <el-form :inline="true">
      <el-form-item label="选择日期">
        <el-date-picker type="date"
          v-model="bussDay"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          :style="{width: '140px'}"
          placeholder="请选择日期"
          size="small"
          @change="handleQuery"
          >
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-time" size="mini" @click="getCalendarToday" >今天</el-button>
        <el-button type="query" icon="el-icon-d-arrow-left" size="mini" @click="getCalendarDev(-1)" >前一天</el-button>
        <el-button type="query" icon="el-icon-d-arrow-right" size="mini" @click="getCalendarDev(1)" >后一天</el-button>
      </el-form-item>
    </el-form>

    <el-row>
      <el-col :span="24">
        <div align="center">
          <span style="color: red;">{{bussDayTitle}}</span>
        </div>
      </el-col>
    </el-row>
    <template v-for="cld in dataList">
      <el-divider content-position="center">
        <i class="el-icon-message-solid"></i>
        {{cld.name}}
      </el-divider>
      <el-timeline v-loading="loading" :reverse="reverse" >
        <el-timeline-item :timestamp="cld.startHour+':00'" type="success" icon="el-icon-message-solid" placement="top">
        </el-timeline-item>
        <template v-for="item in cld.detailList">
          <el-timeline-item :timestamp="item.occurTimeStr" :type="item.type" placement="top">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <svg-icon icon-class="health" />
                <span>
                  针对疾病:{{item.disease}}
                </span>
                <el-button size="mini" type="text" style="color: red;float: right; padding: 3px 0" icon="el-icon-delete" @click="handleStop(item)"
                  v-hasPermi="['health:treat:treatDrug:edit']">
                  暂停
                </el-button>
                <el-divider direction="vertical"></el-divider>
                <el-button size="mini" type="text" style="float: right; padding: 3px 0" icon="el-icon-plus" @click="handleAddDrugDetail(item)"
                  v-if="item.occurTime == null"
                  v-hasPermi="['health:treat:treatDrugDetail:create']">
                  服用
                </el-button>
              </div>
              <div>
                <el-divider direction="vertical"></el-divider>
                <span>
                  {{ item.perDay }}天
                  <el-tag>{{ item.perTimes }}</el-tag>
                  次
                </span>
                <el-divider direction="vertical"></el-divider>
                <span>
                  每次
                  <el-tag>{{ item.ec }}</el-tag>
                  {{ item.eu }}
                </span>
                <el-divider direction="vertical"></el-divider>
                <span>
                  <el-tag>{{item.useWay}}</el-tag>
                </span>
                <el-divider direction="vertical"></el-divider>
                <p>{{item.name}}</p>
              </div>
            </el-card>
          </el-timeline-item>
        </template>
        <el-timeline-item :timestamp="cld.endHour+':59'" type="success" icon="el-icon-message-solid" placement="top">
        </el-timeline-item>
      </el-timeline>
    </template>

    <!-- 新增用药页面 -->
    <el-dialog :title="drugDetailTitle" width="450px" :visible.sync="drugDetailVisible"  append-to-body>
      <treat-drug-detail-detail
        :treatForDrugDetailData="treatForDrugDetailData"
        @closeMe="closeTreatDrugDetailDetail"
        @refreshList="getList"
      />
    </el-dialog>

  </div>
</template>

<script>
  import {calendar} from "@/api/health/treat/treatDrug";
  import {getNowDateString,getNowDateTimeString,getDayByDate,tillNowDays} from "@/utils/datetime";
  import TreatDrugDetailDetail from '../treatDrugDetail/detail'

export default {
  name: "Calendar",
  components: {
    'treat-drug-detail-detail':TreatDrugDetailDetail
  },
  data() {
    return {
      reverse:false,
      loading:false,
      //数据列表
      dataList:[],
      //日期标题
      bussDayTitle:undefined,
      bussDay:getNowDateString(),
      //用药明细start
      drugDetailTitle:'',
      drugDetailVisible:false,
      treatForDrugDetailData:{},
      //用药明细end
    };
  },
  created() {
    this.setBussDayTitle();
    this.getList();
  },
  methods: {
    /** 今天 */
    getCalendarToday() {
      this.bussDay = getNowDateString();
      this.setBussDayTitle();
      this.handleQuery();
    },
    /** 前一天/后一天 */
    getCalendarDev(n) {
      let dd = this.bussDay;
      dd = getDayByDate(n,dd);
      this.bussDay = dd;
      this.setBussDayTitle();
      this.handleQuery();
    },
    /** 设置日期标题 */
    setBussDayTitle(){
      const now = new Date(Date.parse(getNowDateString().replace(/-/g,"/")));
      const bd = new Date(Date.parse(this.bussDay.replace(/-/g,"/")));
      const days = tillNowDays(now,bd);
      switch(days){
        case 0:
          this.bussDayTitle='今天,'+this.bussDay.substr(5,5);
          break;
        case 1:
          this.bussDayTitle='明天,'+this.bussDay.substr(5,5);
          break;
        case -1:
          this.bussDayTitle='昨天,'+this.bussDay.substr(5,5);
          break;
        default:
          if(days>0){
            this.bussDayTitle=days+'天后,'+this.bussDay.substr(5,5);
          }else{
            this.bussDayTitle=(0-days)+'天前,'+this.bussDay.substr(5,5);
          }
      }
    },
    /** 增加用药详情编辑操作 */
    handleAddDrugDetail(row){
      this.drugDetailVisible = true;
      this.drugDetailTitle = "添加用药("+row.name+")";
      const now = getNowDateTimeString();
      const occurTime = this.bussDay+now.substr(10,8);
      this.treatForDrugDetailData = Object.assign({}, this.treatForDrugDetailData, {
        treatDrugId: row.treatDrugId,
        occurTime:occurTime
      });
    },
    closeTreatDrugDetailDetail(){
      this.drugDetailVisible = false;
    },
    /** 停药操作 */
    handleStop(row){
      this.$message({
        message: '暂时未实现',
        type: 'warning'
      });
    },
    /** 查询列表 */
    getList() {
      this.getCalendarList();
    },
    //列表数据
    getCalendarList() {
      this.loading=true;
      let para={
        bussDay:this.bussDay
      };
      calendar(para).then(
        response => {
          let datas = response;
          for(let i=0;i<datas.length;i++){
            let detailList = datas[i].detailList;
            for(let j=0;j<detailList.length;j++){
              let dt = detailList[j];
              if(dt.occurTime==null){
                dt.occurTimeStr = '未服用';
                dt.type='danger';
              }else{
                dt.occurTimeStr = dt.occurTime.substr(11,5);
                dt.type='primary';
              }
              if(dt.match==false){
                dt.occurTimeStr+='(未匹配)';
                dt.type='warning';
              }
            }
          }
          this.dataList = datas;
          this.loading=false;
        }
      );
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    }
  }
};
</script>
