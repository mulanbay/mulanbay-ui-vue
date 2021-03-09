<template>
  <div class="app-container">
    <el-form>
      <el-form-item>
        <el-button type="primary" icon="el-icon-s-data" size="mini" @click="handleNextAchieveMilestone('CURRENT')">待实现的下一个里程碑（针对当前）</el-button>
        <el-button type="primary" icon="el-icon-s-data" size="mini" @click="handleNextAchieveMilestone('WHOLE')">待实现的下一个里程碑(针对全部)</el-button>
        <el-button type="primary" icon="el-icon-refresh" size="mini" @click="handleQuery">刷新</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="dataList" >
      <el-table-column label="ID">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="别名" align="center">
        <template slot-scope="{row}">
          <span>{{ row.alais }}</span>
        </template>
      </el-table-column>
      <el-table-column label="锻炼值" align="center">
        <template slot-scope="{row}">
          <span>{{ row.kilometres+row.sportType.unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="锻炼时长(分钟)" align="center"  width="120">
        <template slot-scope="{row}">
          <span>{{ row.minutes }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开始日期" align="center">
        <template slot-scope="{row}">
          <span>{{ row.fromExerciseDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实现日期" align="center">
        <template slot-scope="{row}">
          <span>{{ row.toExerciseDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="花费天数" align="center">
        <template slot-scope="{row}">
          <span>{{ row.costDays }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 详情对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="400px" append-to-body>
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="运动" prop="sportTypeName">
          <el-input v-model="form.sportTypeName" placeholder="" :style="{width: '200px'}" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="" :style="{width: '200px'}"/>
        </el-form-item>
        <el-form-item label="别名" prop="alais">
          <el-input v-model="form.alais" placeholder="" :style="{width: '200px'}"/>
        </el-form-item>
        <el-form-item label="锻炼值" prop="kilometres">
          <el-input-number v-model="form.kilometres" controls-position="right" :min="0" :controls="true" :precision="2"/>
          <span>{{ sportTypeUnit }}</span>
        </el-form-item>
        <el-form-item label="锻炼时长" prop="minutes">
          <el-input-number v-model="form.minutes" controls-position="right" :min="0" :controls="true" :precision="0"/>
          分钟
        </el-form-item>
        <el-form-item label="顺序" prop="orderIndex">
          <el-input-number v-model="form.orderIndex" controls-position="right" :min="0" :controls="true" :precision="0"/>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="" :style="{width: '200px'}"></el-input>
        </el-form-item>
      </el-form>
    </el-dialog>

</div>
</template>

<script>
import {getSportExerciseAchieveMilestones,getSportExerciseNextAchieveMilestone} from "@/api/sport/sportExercise";

export default {
  name: "SportMilestoneAchieveList",
  props: {
      //父层带过来的预算信息值
      sportExerciseData: {
        id:undefined
      }
  },
  mounted() {
     //this.initChart();
  },
  data() {
    return {
      // 加载层信息
      loading: false,
      // 查询参数
      queryParams: {
        sportExerciseId:undefined
      },
      dataList:[],
      open:false,
      title:'',
      sportTypeUnit:'',
      form:{}
    };
  },
  created() {
    //获取父页面来的值
    this.queryParams.sportExerciseId = this.sportExerciseData.id;
    this.getList();
  },
  //监听父层带过来的账户信息值
  watch:{
    sportExerciseData(newVal,oldVal){
      this.queryParams.sportExerciseId = newVal.id;
      this.getList();
    }
  },
  methods: {
    /** 下一个里程碑 */
    handleNextAchieveMilestone(type){
      if(type=='CURRENT'){
        this.title='待实现的下一个里程碑（针对当前）';
      }else{
        this.title='待实现的下一个里程碑(针对全部)';
      }
      const para = {
        type:type,
        sportExerciseId:this.queryParams.sportExerciseId
      }
      getSportExerciseNextAchieveMilestone(para).then(response => {
        if(response){
          this.form = response;
          this.form.sportTypeName = response.sportType.name;
          this.sportTypeUnit = response.sportType.unit;
          this.open = true;
        }else{
          this.msgError('没有相关里程碑信息');
        }
      });
    },
    // 打开加载层
    openLoading() {
      this.loading = true;
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
    },
    getList() {
      this.loading=true;
      //不分页
      this.queryParams.page=0;
      this.queryParams.needTotal=false;
      getSportExerciseAchieveMilestones(this.queryParams).then(
        response => {
          this.dataList=response.rows;
          this.loading=false;
        }
      );
    }
  }
};
</script>
