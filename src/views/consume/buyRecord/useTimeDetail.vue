<template>
  <div class="app-container">
    <el-card>
      <el-col :span="24" class="card-box">
        <div>
          <el-descriptions class="margin-top" :column="1" :size="'5'" border :labelStyle="{width: '130px'}" title="商品信息">
            <template slot="extra">
              <el-button type="query" icon="el-icon-refresh" size="mini" @click="handleCostStat" v-hasPermi="['consume:buyRecord:costStat']">刷新</el-button>
            </template>
            <el-descriptions-item>
              <template slot="label">
                <i class="el-icon-star-on"></i>
                当前商品
              </template>
              <div class="cell">{{ buyRecordData.goodsName }}</div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-col>
    </el-card>
    </br>
    <el-card>
      <el-col :span="24" class="card-box">
        <div>
          <el-steps :active="timelineSize" align-center finish-status="success">
            <template v-for="item in timelineList">
              <el-step :title="item.key" :description="item.value"></el-step>
            </template>
          </el-steps>
        </div>
      </el-col>
    </el-card>
    </br>
    <el-card>
      <el-col :span="12" class="card-box">
        <el-card>
          <el-divider content-position="center">系统寿命配置</el-divider>
          <lifetime-compare :lifetimeCompareData="lifetimeCompareData" />
        </el-card>
      </el-col>
      <el-col :span="12" class="card-box">
        <el-card>
          <el-divider content-position="center">成本计算</el-divider>
          <el-form :model="queryParams" ref="queryForm" :inline="true">
            <el-form-item label="成本关联子下级" prop="deepCost">
              <el-switch v-model="queryParams.deepCost"  @change="handleCostStat" ></el-switch>
              <span class="link-type" @click="msgAlert('提示','如果关联子下级，那么会统计该商品的下级及其下级，为树形统计.')"><i class="el-icon-question" /></span>
            </el-form-item>
            <el-form-item>
              <el-button type="query" icon="el-icon-s-data" size="mini" @click="handleCostStat" v-hasPermi="['consume:buyRecord:costStat']">统计</el-button>
            </el-form-item>
          </el-form>
          <!--列表数据-->
          <el-table :data="dataList" v-loading="loading" >
            <el-table-column label="项目" prop="key" align="center">
              <template slot-scope="{row}">
                {{ row.key }}
              </template>
            </el-table-column>
            <el-table-column label="数值" prop="value" align="center">
              <template slot-scope="{row}">
                {{ row.value }}
              </template>
            </el-table-column>
            <el-table-column label="说明" prop="desc" align="center" width="60px">
              <template slot-scope="{row}">
                <span v-if="row.desc != null" class="link-type" @click="msgAlert('提示',row.desc)"><i class="el-icon-question" /></span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-card>

  </div>
</template>

<script>
  import {getBuyRecord,getBuyRecordCostStat} from "@/api/consume/buyRecord";
  import {hourDiff,dateDiff,formatDays,getNowDateTimeString,getNowDateString} from "@/utils/datetime";
  import LifetimeCompare from '../goodsLifetime/compare'

export default {
  name: "BuyRecordUseTimeDetail",
  components: {
    'lifetime-compare':LifetimeCompare
  },
  props: {
      //父层带过来的信息值
      buyRecordCCData: {id:undefined}
  },
  data() {
    return {
      deepCost:true,
      buyRecordData:{},
      lifetimeCompareData:{},
      //时间线统计
      timelineSize:1,
      timelineList:[],
      //列表数据
      dataList:[],
      loading: false,
      queryParams:{
        deepCost:false,
        id:undefined
      }
    };
  },
  created() {
    this.handleReceiveData(this.buyRecordCCData);
  },
  //监听父层带过来的账户信息值
  watch:{
    buyRecordCCData: {
      deep: true,
      handler(val) {
        this.buyRecordCCData =val;
        this.handleReceiveData(this.buyRecordCCData);
      }
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.loadBuyRecord(data.id);
    },
    //加载明细
    loadBuyRecord(id){
      if(id==undefined|| id==null){
        return;
      }
      getBuyRecord(id).then(response => {
        this.buyRecordData = response;
        //时间线
        this.handleTimeline();
        this.handleCostStat();
      });
    },
    /** 处理时间线 */
    handleTimeline(){
      let buyRecord = this.buyRecordData;
      this.timelineList = [];
      let tlData  = new Array();
      if(buyRecord.buyDate==buyRecord.consumeDate){
        tlData.push({key:'购买/消费时间',value :buyRecord.buyDate });
      }else{
        tlData.push({key:'购买时间',value :buyRecord.buyDate });
        tlData.push({key:'消费时间',value :buyRecord.consumeDate });
      }
      if(buyRecord.expectDeleteDate!=null){
        tlData.push({key:'期望废弃时间',value :buyRecord.expectDeleteDate });
      }
      if(buyRecord.deleteDate!=null){
        tlData.push({key:'废弃/售出时间',value :buyRecord.deleteDate });
      }
      //
      const len = tlData.length;
      this.timelineSize = len;
      //赋值
      this.timelineList = tlData;
    },
    /** 成本分析 */
    handleCostStat(){
      this.dataList = [];
      this.loading = true;
      this.queryParams.id = this.buyRecordCCData.id
      getBuyRecordCostStat(this.queryParams).then(response => {
        let cc = response;
        var brData  = new Array();
        brData.push({key:'买入价格',value :this.formatMoney(cc.totalPrice) });
        let usedDays = cc.usedMillSecs/(24*3600*1000);
        brData.push({key:'使用时长',value :formatDays(usedDays),desc:'购买时间距离废弃时间的时间差，如果没有废弃时间那么距离当前时间的时间差' });
        if(cc.deleteDate==null&&cc.expMillSecs!=null){
          brData.push({key:'离预期作废',value :formatDays(cc.expMillSecs/(24*3600*1000)) });
        }
        let spDesc ='';
        if(cc.soldPrice!=null){
          let sb = cc.totalPrice-cc.soldPrice;
          if(sb>0){
            spDesc ='亏'+sb.toFixed(2)+'元';
          }else{
            spDesc ='赚'+(0-sb).toFixed(2)+'元';
          }
        }
        brData.push({key:'售出价格',value :this.formatMoney(cc.soldPrice),desc:spDesc });
        if(cc.childrens>0){
          brData.push({key:'下级商品成本',value :this.formatMoney(cc.childrenPrice)+' ('+cc.childrens+'个)',desc:'该商品所有下级商品的个数' });
        }
        if(cc.childrenSoldPrice!=null){
          brData.push({key:'下级商品售出',value :this.formatMoney(cc.childrenSoldPrice),desc:'该商品所有下级商品的售出价格总额' });
        }
        brData.push({key:'总成本',value :this.formatMoney(cc.totalCost),desc:'该商品买入价格和下级商品的总价之和' });
        brData.push({key:'每天花费',value :this.formatMoney(cc.costPerDay)+' / '+this.formatMoney(cc.totalCostPerDay),desc:'前项:(买入价格-售出价格)/使用天数.</br>后项:(买入价格-售出价格+下级商品成本-下级商品售出价格)/使用天数' });
        if(cc.soldPrice!=null){
          brData.push({key:'折旧率',value :(cc.depRate.toFixed(1)+'折 / '+cc.totalDepRate.toFixed(1)+'折'),desc:'前项:售出价格/买入价格.</br>后项:售出价格/(总成本-下级商品售价)'});
        }
        this.dataList = brData;
        this.loading = false;
        //跟系统配置比对
        this.lifetimeCompareData = Object.assign({}, this.lifetimeCompareData, {
          goodsName: this.buyRecordData.goodsName,
          usedDays: usedDays
        });
      });
    }
  }
};
</script>
