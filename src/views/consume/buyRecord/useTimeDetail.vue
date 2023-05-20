<template>
  <div class="app-container">
    <el-card>
      <el-col :span="24" class="card-box">
        <div>
          <el-descriptions class="margin-top" :column="1" :size="'5'" border :labelStyle="{width: '130px'}" title="商品信息">
            <template slot="extra">
              <el-button type="query" icon="el-icon-refresh" size="mini" @click="handleCostStat" v-hasPermi="['consume:buyRecord:childrenTotalCost']">刷新</el-button>
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
      <el-col :span="10" class="card-box">
        <el-card>
          <lifetime-compare :lifetimeCompareData="lifetimeCompareData" />
        </el-card>
      </el-col>
      <el-col :span="14" class="card-box">
        <el-card>
          <el-form :model="queryParams" ref="queryForm" :inline="true">
            <el-form-item label="成本关联子下级" prop="deepCost">
              <el-switch v-model="queryParams.deepCost"  @change="handleCostStat" ></el-switch>
              <span class="link-type" @click="msgAlert('提示','如果关联子下级，那么会统计该商品的下级及其下级，为树形统计.')"><i class="el-icon-question" /></span>
            </el-form-item>
            <el-form-item>
              <el-button type="query" icon="el-icon-s-data" size="mini" @click="handleCostStat" v-hasPermi="['consume:buyRecord:childrenTotalCost']">统计</el-button>
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
            <el-table-column label="说明" prop="desc" align="center">
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
  import {getBuyRecord,getBuyRecordChildrenTotalCost} from "@/api/consume/buyRecord";
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
      getBuyRecordChildrenTotalCost(this.queryParams).then(response => {
        let childrenTotalCost = (response.totalPrice==null? 0: response.totalPrice.toFixed(2)*1);
        let childrenTotalSold = (response.soldPrice==null? 0: response.soldPrice.toFixed(2)*1);
        let buyRecord = this.buyRecordData;
        var brData  = new Array();
        //brData.push({key:'购买时间',value :buyRecord.buyDate });
        brData.push({key:'买入价格',value :this.formatMoney(buyRecord.totalPrice) });
        //brData.push({key:'售出时间',value :buyRecord.deleteDate });
        let date = buyRecord.deleteDate;
        if(date ==null){
          date = getNowDateString();
        }
        let usedDays = dateDiff(buyRecord.buyDate.substr(0, 10),date);
        brData.push({key:'使用时长',value :formatDays(usedDays),desc:'购买时间距离废弃时间的时间差，如果没有废弃时间那么距离当前时间的时间差' });
        if(buyRecord.deleteDate==null&&buyRecord.expectDeleteDate!=null){
          let exDays = dateDiff(getNowDateString(),buyRecord.expectDeleteDate.substr(0, 10));
          brData.push({key:'离预期作废',value :formatDays(exDays) });
        }
        brData.push({key:'售出价格',value :this.formatMoney(buyRecord.soldPrice) });
        if(response.totalCount!=null&&response.totalCount>0){
          brData.push({key:'下级商品成本',value :this.formatMoney(childrenTotalCost)+' ('+response.totalCount+'个)',desc:'该商品所有下级商品的个数' });
        }
        if(childrenTotalSold>0){
          brData.push({key:'下级商品售出',value :this.formatMoney(childrenTotalSold),desc:'该商品所有下级商品的售出价格总额' });
        }
        let totalCost = buyRecord.totalPrice*1+childrenTotalCost;
        brData.push({key:'总成本',value :this.formatMoney(totalCost),desc:'该商品买入价格和下级商品的总价之和' });
        //不包括下级商品
        let dailyCost = '';
        //包含下级商品
        let dailyCost2 = '';
        if(buyRecord.soldPrice==null){
        	dailyCost = (buyRecord.totalPrice)/usedDays;
          dailyCost2 = (buyRecord.totalPrice+childrenTotalCost-childrenTotalSold)/usedDays;
        }else{
        	dailyCost = (buyRecord.totalPrice-buyRecord.soldPrice)/usedDays;
          dailyCost2 = (buyRecord.totalPrice-buyRecord.soldPrice+childrenTotalCost-childrenTotalSold)/usedDays;
        }
        brData.push({key:'每天花费',value :this.formatMoney(dailyCost)+' / '+this.formatMoney(dailyCost2),desc:'前项:(买入价格-售出价格)/使用天数.</br>后项:(买入价格-售出价格+下级商品成本-下级商品售出价格)/使用天数' });
        if(buyRecord.soldPrice!=null){
          let dd = buyRecord.soldPrice*10/buyRecord.totalPrice;
          let dd2 = buyRecord.soldPrice*10/(totalCost-childrenTotalSold);
          brData.push({key:'折旧率',value :(dd.toFixed(1)+'折 / '+dd2.toFixed(1)+'折'),desc:'前项:售出价格/买入价格.</br>后项:售出价格/(总成本-下级商品售价)'});
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
