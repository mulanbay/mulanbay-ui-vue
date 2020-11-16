<template>
  <div class="app-container">
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
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-form ref="form" :model="form" :rules="rules" label-width="140px" size="small" border="true">
        <el-row>
          <el-col :span="12">
            <el-form-item label="预算金额" prop="budgetAmount">
             <el-input-number v-model="form.budgetAmount" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2"/>元
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="已经消费/预算比例" prop="consumeBudgetRate">
             <el-input-number v-model="form.consumeBudgetRate" placeholder="" controls-position="right" :min="0" :controls="false" :precision="2"/>%
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="总消费金额" prop="consumeAmount">
             <el-input-number v-model="form.consumeAmount" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2"/>元
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="普通消费金额" prop="ncAmount">
             <el-input-number v-model="form.ncAmount" placeholder="" controls-position="right" :min="0" :controls="false" :precision="2"/>元
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="突发消费金额" prop="bcAmount">
             <el-input-number v-model="form.bcAmount" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2"/>元
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="看病花费金额" prop="trAmount">
             <el-input-number v-model="form.trAmount" placeholder="" controls-position="right" :min="0" :controls="false" :precision="2"/>元
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="收入" prop="lastIncome">
             <el-input-number v-model="form.lastIncome" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2"/>元
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer" align="center">
        <!--列表数据-->
        <el-table v-loading="loading" :data="dataList" >
          <el-table-column label="ID" prop="id" sortable="custom" align="center" width="60">
            <template slot-scope="{row}">
              <span>{{ row.id }}</span>
            </template>
          </el-table-column>
          <el-table-column label="名称" min-width="120px">
            <template slot-scope="{row}">
              <span class="link-type">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="预算金额" align="center" width="95">
            <template slot-scope="{row}">
              <span>{{ row.amount }}</span>
            </template>
          </el-table-column>
          <el-table-column label="类型" align="center" width="70">
            <template slot-scope="{row}">
              <span>{{ row.typeName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="周期类型" align="center" width="75">
            <template slot-scope="{row}">
              <span>{{ row.periodName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="系数" align="center" width="60">
            <template slot-scope="{row}">
              <span>{{ row.drate }}</span>
            </template>
          </el-table-column>
          <el-table-column label="总金额" align="center" width="95">
            <template slot-scope="{row}">
              <span>{{ row.ttAmount }}</span>
            </template>
          </el-table-column>
          <el-table-column label="百分比" align="center" width="95">
            <template slot-scope="{row}">
              <span>{{ row.pp }}</span>
            </template>
          </el-table-column>
          <el-table-column label="占据收入" align="center" width="95">
            <template slot-scope="{row}">
              <span>{{ row.bir }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
  </div>
</template>

<script>
import {getBudgetAnalyse} from "@/api/fund/budget";
import {getPercent} from "@/utils/mulanbay";

export default {
  name: "AnalyseDetail",
  props: {
      //父层带过来的预算信息值
      budgetData: {
        budgetId: '',
      }
  },
  data() {
    return {
      loading:false,
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
      // 表单参数
      form: {
        budgetId:undefined
      },
      //列表数据
      dataList:[],
      // 查询参数
      queryParams: {
        period:'MONTHLY',
        yearMonth:this.getFormatDate(new Date(),"yyyy-MM")
      },
      rules: {}
    };
  },
  created() {
    this.handleQuery();
  },
  //监听父层带过来的账户信息值
  watch:{

  },
  methods: {
    /** 计算运营日 */
    getBussDay(period){
      if(period=='YEARLY'){
        return this.queryParams.year+'-01-01';
      }else{
        return this.queryParams.yearMonth+'-01';
      }
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
    },
    //查询
    handleQuery(){
      this.loading = true;
      const period = this.queryParams.period;
      this.queryParams.date = this.getBussDay(period);
      getBudgetAnalyse(this.queryParams).then(
        response => {
          //表单数据
          var consumeBudgetRate = getPercent(response.consumeAmount,response.budgetAmount);
          this.form.budgetAmount=response.budgetAmount;
          this.form.consumeBudgetRate=consumeBudgetRate;
          this.form.ncAmount=response.ncAmount;
          this.form.bcAmount=response.bcAmount;
          this.form.trAmount=response.trAmount;
          this.form.consumeAmount=response.consumeAmount;
          this.form.lastIncome=response.lastIncome;
          //列表数据
          var budgetList = response.budgetList;
          var list = new Array();
          for (var i = 0; i < budgetList.length; i++) {
            var ttAmount = budgetList[i].drate*budgetList[i].amount;
            var bir='--';
            if(response.lastIncome>0){
              bir = getPercent(ttAmount,response.lastIncome)+'%'
            }
            var row= {
              id:i+1,
              name:budgetList[i].name,
              amount:this.formatMoneyWithSymbal(budgetList[i].amount),
              typeName:budgetList[i].typeName,
              periodName:budgetList[i].periodName,
              drate:budgetList[i].drate,
              ttAmount:this.formatMoneyWithSymbal(ttAmount),
              pp:getPercent(ttAmount,response.budgetAmount)+'%',
              bir:bir
            };
            list.push(row);
          }
          this.dataList = list;
          this.loading = false;
        }
      );
    }
  }
};
</script>
