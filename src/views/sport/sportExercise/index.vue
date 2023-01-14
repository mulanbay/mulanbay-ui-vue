<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="选择运动" prop="sportTypeId">
        <el-select
          v-model="queryParams.sportTypeId"
          placeholder="运动"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in sportTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="锻炼日期">
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
      <el-form-item v-if="moreCdn==true" label="筛选最佳" prop="containBest">
        <el-switch v-model="queryParams.containBest"  @change="handleQuery"></el-switch>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="排序方式" prop="sortField">
        <el-select
          v-model="queryParams.sortField"
          placeholder="排序方式"
          collapse-tags
          size="small"
          style="width: 140px"
        >
          <el-option
            v-for="dict in sortFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.sortType"
          placeholder="排序方式"
          collapse-tags
          size="small"
          style="width: 100px"
        >
          <el-option
            v-for="dict in sortTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['sport:sportExercise:query']">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-more" size="mini" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleCreate"
          v-hasPermi="['sport:sportExercise:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['sport:sportExercise:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['sport:sportExercise:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['sport:sportExercise:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-document"
          size="mini"
          :disabled="single"
          @click="handleLifeArchives"
          v-hasPermi="['life:lifeArchives:create']"
        >同步档案</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="stat"
          icon="el-icon-s-data"
          size="mini"
          @click="handleMultiStat"
          v-hasPermi="['sport:sportExercise:multiStat']"
        >数据统计</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-refresh"
            size="mini"
            @click="handleRefreshMaxStat"
            v-hasPermi="['sport:sportExercise:refreshMaxStat']"
          >刷新最佳统计</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="stat"
          icon="el-icon-s-data"
          size="mini"
          @click="planStat"
          v-hasPermi="['report:plan:userPlan:commonStat']"
        >计划统计</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="sportExerciseList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="运动类型" align="center" min-width="120px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.sportType.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="锻炼时间" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.exerciseDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="时辰" align="center" width="50">
        <template slot-scope="{row}">
          <span>{{ getHourInfo(row.exerciseDate) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="锻炼信息" align="center">
      <el-table-column label="锻炼值" align="center"  width="120">
        <template slot-scope="{row}">
          <span>{{ row.kilometres+row.sportType.unit }}</span>
          <span v-if="'CURRENT' ==row.mileageBest">
           <el-tag type="success">当前最佳</el-tag>
          </span>
          <span v-if="'ONCE' ==row.mileageBest">
           <el-tag type="success">历史最佳</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="锻炼时长(分钟)" align="center">
        <template slot-scope="{row}">
          <span v-if="row.minutes<60" style="color: red;">
           {{ row.minutes }}
          </span>
          <span v-else>{{ row.minutes }}</span>
        </template>
      </el-table-column>
      </el-table-column>
      <el-table-column label="速度信息" align="center">
      <el-table-column label="平均速度(公里/小时)" align="center" width="90">
        <template slot-scope="{row}">
          <span>{{ row.speed }}</span>
          <span v-if="'CURRENT' ==row.fastBest">
           <el-tag type="success">当前最佳</el-tag>
          </span>
          <span v-if="'ONCE' ==row.fastBest">
           <el-tag type="success">历史最佳</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="最佳速度(公里/小时)" align="center" width="90">
        <template slot-scope="{row}">
          <span>{{ row.maxSpeed }}</span>
        </template>
      </el-table-column>
      <el-table-column label="平均配速(分钟/公里)" align="center" width="90">
        <template slot-scope="{row}">
          <span>{{ row.pace }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最佳配速(分钟/公里)" align="center" width="90">
        <template slot-scope="{row}">
          <span>{{ row.maxPace }}</span>
        </template>
      </el-table-column>
      </el-table-column>
      <el-table-column label="心率信息" align="center">
      <el-table-column label="最大心率" align="center">
        <template slot-scope="{row}">
          <span v-if="row.maxHeartRate>=row.safeMaxHeartRate" style="color: red;">
           {{ row.maxHeartRate }}
          </span>
          <span v-else>{{ row.maxHeartRate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="平均心率" align="center">
        <template slot-scope="{row}">
          <span v-if="row.averageHeartRate>=row.safeMaxHeartRate*0.8" style="color: red;">
           {{ row.averageHeartRate }}
          </span>
          <span v-else>{{ row.averageHeartRate }}</span>
        </template>
      </el-table-column>
      </el-table-column>
      <el-table-column label="统计分析" align="center">
      <el-table-column label="里程碑" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleAchieveMilestone(row.id)"><i class="el-icon-s-data" /></span>
        </template>
      </el-table-column>
      <el-table-column label="身体近况" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="showBodyAbnormalRecordAnalyse()"><i class="el-icon-s-data" /></span>
        </template>
      </el-table-column>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['sport:sportExercise:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['sport:sportExercise:delete']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>


    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.page"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="750px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="运动类型" prop="sportTypeId">
               <el-select
                 v-model="form.sportTypeId"
                 placeholder="运动类型"
                 clearable
                 collapse-tags
                 size="small"
                 style="width: 200px"
                 @change="handleSportTypeChange"
               >
                 <el-option
                   v-for="dict in sportTypeOptions"
                   :key="dict.id"
                   :label="dict.text"
                   :value="dict.id"
                 />
               </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="锻炼时间" prop="exerciseDate">
              <el-date-picker type="datetime" v-model="form.exerciseDate" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                        :style="{width: '200px'}" placeholder="请选择时间" clearable >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="锻炼值" prop="kilometres">
             <el-input-number v-model="form.kilometres" :style="{width: '200px'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="2" />
             <span>{{ sportTypeUnit }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="锻炼时长" prop="minutes">
             <el-input-number v-model="form.minutes" :style="{width: '200px'}" placeholder="单位:分钟" controls-position="right" :min="0" :controls="false" :precision="0" />
             分钟
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="平均配速" prop="pace">
             <el-input-number v-model="form.pace" :style="{width: '200px'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="2" />
             分钟/公里
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最佳配速" prop="maxPace">
             <el-input-number v-model="form.maxPace" :style="{width: '200px'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="2" />
             分钟/公里
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="平均速度" prop="speed">
             <el-input-number v-model="form.speed" :style="{width: '200px'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="2" />
             公里/小时
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最佳速度" prop="maxSpeed">
             <el-input-number v-model="form.maxSpeed" :style="{width: '200px'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="2" />
             公里/小时
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="平均心率" prop="averageHeartRate">
             <el-input-number v-model="form.averageHeartRate" :style="{width: '200px'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
             次
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大心率" prop="maxHeartRate">
             <el-input-number v-model="form.maxHeartRate" :style="{width: '200px'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
             次
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 数据统计 -->
    <el-dialog title="数据统计" width="900px" :visible.sync="multiStatVisible">
      <multi-stat />
    </el-dialog>

    <!-- 里程碑信息统计 -->
    <el-dialog :title="achieveMilestoneTitle" width="900px" :visible.sync="achieveMilestoneVisible">
      <achieve-milestone :sportExerciseData="sportExerciseData"/>
    </el-dialog>

    <!-- 人生档案详情页面 -->
      <el-dialog :title="ladTitle" width="650px" :visible.sync="ladOpen"  append-to-body>
        <life-archives-detail :lifeArchivesData="lifeArchivesData" @closeMe="closeLad"/>
      </el-dialog>
    </div>

  </div>
</template>

<script>
import {fetchList,getSportExercise,createSportExercise,updateSportExercise,deleteSportExercise,refreshSportExerciseMaxStat} from "@/api/sport/sportExercise";
import {getSportTypeTree,getSportType} from "@/api/sport/sportType";
import MultiStat from './multiStat'
import AchieveMilestone from '../sportMilestone/achieveList'
import {dispatchCommonStat} from "@/utils/planUtils";
import LifeArchivesDetail from '../../life/lifeArchives/detail'
import {getHourDesc} from "@/utils/datetime";

export default {
  name: "SportExercise",
  components: {
    'multi-stat':MultiStat,
    'achieve-milestone':AchieveMilestone,
    'life-archives-detail':LifeArchivesDetail
  },
  data() {
    return {
      //查询条件更多属性 start
      cdnTitle:'更多',
      moreCdn:false,
      //查询条件更多属性 end
      //同步档案属性 start
      ladTitle:'',
      ladOpen:false,
      lifeArchivesData:{},
      //同步档案属性 end
      //表单中的运动类型的单位
      sportTypeUnit:'',
      //统计页面的显示
      multiStatVisible:false,
      //已实现里程碑
      achieveMilestoneVisible:false,
      //已实现里程碑标题
      achieveMilestoneTitle:'',
      //子页面使用
      sportExerciseData:{
        id:undefined
      },
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 列表数据
      sportExerciseList:[],
      //运动类型
      sportTypeOptions:[],
      //排序字段
      sortFieldOptions:[],
      //排序方式
      sortTypeOptions:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      commonStatusOptions:this.commonStatusOptions,
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        sortField:'EXERCISEDATE',
        sortType:'desc'
      },
      // 表单参数
      form: {},
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 表单校验
      rules: {
        sportTypeId: [
          { required: true, message: "运动类型不能为空", trigger: "blur" }
        ],
        exerciseDate: [
          { required: true, message: "锻炼时间不能为空", trigger: "blur" }
        ],
        kilometres: [
          { required: true, message: "锻炼值不能为空", trigger: "blur" }
        ],
        minutes: [
          { required: true, message: "锻炼时长不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    //排序字段
    this.getDictItemTree('SPORT_EXERCISE_ORDER_BY_FIELD',false).then(response => {
      this.sortFieldOptions = response;
    });
    //排序方式
    this.getDictItemTree('SORT_TYPE',false).then(response => {
      this.sortTypeOptions = response;
    });
    this.getList();
    this.getSportTypeTreeselect();
  },
  methods: {
    /** 更多查询条件处理 */
    handleMoreCdn(){
      if(this.moreCdn==true){
        //this.resetForm("queryForm");
        this.moreCdn=false;
        this.cdnTitle='更多';
      }else{
        this.moreCdn=true;
        this.cdnTitle='取消';
      }
    },
    /** 同步档案 */
    handleLifeArchives(){
      const id = this.ids.join(",")
      getSportExercise(id).then(response => {
        this.ladTitle='同步档案';
        this.ladOpen=true;
        this.lifeArchivesData={
          id:undefined,
          title:'锻炼信息',
          content:response.sportType.name+','+response.kilometres+response.sportType.unit+',时长:'+response.minutes+'分钟',
          date:response.exerciseDate,
          bussType:'SPORT_EXERCISE',
          relatedBeans:'SportExercise',
          sourceId:response.id,
          remark:undefined
        };
      });
    },
    /** 关闭同步档案 */
    closeLad(){
      this.ladOpen=false;
    },
    /** 计划统计 */
    planStat(){
      dispatchCommonStat('SportExercise',this.$router);
    },
    /** 身体不适分析 */
    showBodyAbnormalRecordAnalyse(){
      //路由定向
      this.$router.push({name:'BodyAbnormalRecordAnalyse',query: {name:'心脏',groupField:'ORGAN'}})
    },
    /** 选择运动类型按钮操作 */
    handleSportTypeChange() {
      getSportType(this.form.sportTypeId).then(response => {
        this.sportTypeUnit = response.unit;
      });
    },
    /** 查询运动类型下拉树结构 */
    getSportTypeTreeselect() {
      getSportTypeTree(false).then(response => {
        this.sportTypeOptions = response;
      });
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.sportExerciseList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    /** 时辰信息 */
    getHourInfo(recordDate) {
      return getHourDesc(recordDate);
    },
    /** 数据统计 */
    handleMultiStat(){
      this.multiStatVisible=true;
    },
    /** 刷新最佳统计 */
    handleRefreshMaxStat(){
      const sportTypeId = this.queryParams.sportTypeId;
      if(this.isObjectEmpty(sportTypeId)){
        this.msgError("请先选择运动类型");
        return;
      }
      const para ={
        sportTypeId:sportTypeId
      };
      this.loading = true;
      refreshSportExerciseMaxStat(para).then(response => {
        this.loading = false;
        this.msgSuccess("刷新成功");
      });
    },
    /** 已实现里程碑 */
    handleAchieveMilestone(id){
      this.achieveMilestoneTitle="里程碑信息(ID:"+id+")";
      this.achieveMilestoneVisible=true;
      //赋值给子页面使用
      this.sportExerciseData = Object.assign({}, this.sportExerciseData, {
        id: id
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        speed: 0,
        maxSpeed:0,
        pace:0,
        maxPace:0,
        maxHeartRate:0,
        averageHeartRate : 0
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleCreate() {
      this.reset();
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids.join(",")
      getSportExercise(id).then(response => {
        this.form = response;
        this.form.sportTypeId = response.sportType.id+'';
        this.sportTypeUnit = response.sportType.unit;
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateSportExercise(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createSportExercise(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids.join(",");
      this.$confirm('是否确认删除编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return deleteSportExercise(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有购买来源数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportSportExercise(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>
