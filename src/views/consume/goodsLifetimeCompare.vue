<template>
  <div class="app-container">

    <!--列表数据-->
    <el-table v-loading="loading" :data="dataList" >
      <el-table-column label="键" prop="key" align="center">
        <template slot-scope="{row}">
          <span>{{ row.key }}</span>
        </template>
      </el-table-column>
      <el-table-column label="值" prop="value" align="center">
        <template slot-scope="{row}">
          <span>{{ row.value }}</span>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
import {aiMatch} from "@/api/consume/goodsLifetime";
import {getBuyRecord} from "@/api/consume/buyRecord";
import {formatDays,dateDiff,getNowDateTimeString,tillNowDays} from "@/utils/datetime";
import {getPercent} from "@/utils/mulanbay";

export default {
  name: "BuyRecordGoodsLifetimeCompare",
  props: {
    //父层带过来的列表值
    buyRecordData: {id:undefined}
  },
  data() {
    return {
      loading:false,
      //列表数据
      dataList:[]
    };
  },
  created() {
    this.handleReceiveData(this.buyRecordData);
  },
  //监听父层带过来的账户信息值
  watch:{
    buyRecordData(newVal,oldVal){
      this.handleReceiveData(newVal);
    }
  },
  methods: {
    handleReceiveData(data){
      this.loading=true;
      this.dataList = new Array();
      getBuyRecord(data.id).then(response => {
        this.compareBuyRecord(response);
      });
    },
    compareBuyRecord(data){
      let days = tillNowDays(null,data.buyDate);
      this.dataList.push({key:'距离现在',value:formatDays(0-days)});
      if(data.deleteDate==null){
        data.days = dateDiff(data.buyDate,getNowDateTimeString());
      }else{
        data.days = dateDiff(data.buyDate,data.deleteDate);
        this.dataList.push({key:'实际使用时长',value:formatDays(data.days)});
      }
      aiMatch(data.goodsName).then(response => {
        if(response!=null){
          this.dataList.push({key:'匹配商品分类',value:response.name});
          this.dataList.push({key:'匹配度',value:response.match});
          this.dataList.push({key:'期望使用时长',value:formatDays(response.days)});
          let p =0;
          if(data.days<=response.days){
            p = getPercent(data.days,response.days).toFixed(0)+'%';
          }else{
            p = (data.days / response.days).toFixed(1)+'倍';
          }
          this.dataList.push({key:'实际/期望比例',value:p});
        }else{
          this.dataList.push({key:'未找到匹配数据',value:''});
        }
        this.loading=false;
      });
    }
  }
};
</script>
