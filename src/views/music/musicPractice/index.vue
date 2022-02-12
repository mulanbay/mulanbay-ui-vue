<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="选择乐器" prop="musicInstrumentId">
        <el-select
          v-model="queryParams.musicInstrumentId"
          placeholder="乐器"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in musicInstrumentOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="练习日期">
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
      <el-form-item label="练习时长">
          <el-input-number v-model="queryParams.minMinutes" clearable :min="0" label="分钟" style="width: 120px"></el-input-number>
          <el-input-number v-model="queryParams.maxMinutes" clearable :min="0" label="分钟" style="width: 120px"></el-input-number>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['music:musicPractice:query']">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleCreate"
          v-hasPermi="['music:musicPractice:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleCreateByTemplate"
          v-hasPermi="['music:musicPractice:createByTemplate']"
        >以模板新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['music:musicPractice:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['music:musicPractice:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['music:musicPractice:export']"
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
          @click="planStat"
          v-hasPermi="['report:plan:userPlan:commonStat']"
        >计划统计</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="musicPraticeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="乐器" min-width="120px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.musicInstrument.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="练习日期" align="center" width="100">
        <template slot-scope="{row}">
          <span>{{ row.practiceDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="练习时间" align="center" width="200">
        <template slot-scope="{row}">
          <span>{{ formatPracticeRange(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="时长(分钟)" align="center" width="120">
        <template slot-scope="{row}">
          <span :style="{'color':getMinutesColor(row.minutes)}">{{ row.minutes }}</span>
        </template>
      </el-table-column>
      <!--
      <el-table-column label="时间段" align="center" width="100">
        <template slot-scope="{row}">
          <el-tag type="success">{{ getHourDesc(row.practiceStartTime) }}</el-tag>
        </template>
      </el-table-column>
      -->
      <el-table-column label="统计" width="60px" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleFromThisStat(row)">
            <i class="el-icon-s-data" />
          </span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['music:musicPractice:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['music:musicPractice:delete']"
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
    <el-dialog :title="title" :visible.sync="open" width="680px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="开始时间" prop="practiceStartTime">
             <el-date-picker type="datetime" v-model="form.practiceStartTime" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                       :style="{width: '100%'}" placeholder="请选择时间" clearable >
             </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="practiceEndTime">
             <el-date-picker type="datetime" v-model="form.practiceEndTime" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                       :style="{width: '100%'}" placeholder="请选择时间" clearable @change="calculateMinutes">
             </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="练习时长" prop="minutes">
             <el-input-number v-model="form.minutes" placeholder="分钟" controls-position="right" :min="0" :controls="false" :precision="0"  :style="{width: '240px'}"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="乐器选择" prop="musicInstrumentId">
             <el-select
               v-model="form.musicInstrumentId"
               placeholder="乐器"
               clearable
               size="small"
               style="width: 240px"
               @change="handleMusicInstrumentChange"
             >
               <el-option
                 v-for="dict in musicInstrumentOptions"
                 :key="dict.id"
                 :label="dict.text"
                 :value="dict.id"
               />
             </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">关 闭</el-button>
      </div>
      
      <!--列表数据-->
      <el-table v-loading="loading" :data="tuneList" >
        <el-table-column label="ID" prop="id" sortable="custom" align="center" width="60">
          <template slot-scope="{row}">
            <span>{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="练习曲子" min-width="120px">
          <template slot-scope="{row}">
            <span class="link-type">{{ row.tune }}</span>
          </template>
        </el-table-column>
        <el-table-column label="练习次数" align="center" width="95">
          <template slot-scope="{row}">
            <span v-if="row.tuneType=='TECH'">
             {{ row.times }}分钟
            </span>
            <span v-else>
              {{ row.times }}遍
            </span>
          </template>
        </el-table-column>
        <el-table-column label="练习类型" align="center" width="75">
          <template slot-scope="{row}">
            <span>{{ row.tuneTypeName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="水平" align="center" width="60">
          <template slot-scope="{row}">
            <span>{{ row.levelName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template slot="header" slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-plus"
              v-if="form.id!=null" 
              @click="handleCreateTune()"
              v-hasPermi="['music:musicPracticeTune:create']"
          >新增</el-button>
          </template>
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdateTune(scope.row)"
              v-hasPermi="['music:musicPracticeTune:edit']"
            >修改</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDeleteTune(scope.row)"
              v-hasPermi="['music:musicPractice:delete']"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 添加或修改曲子对话框 -->
    <el-dialog :title="tuneTitle" :visible.sync="tuneOpen" width="450px" append-to-body>
      <el-form ref="tuneForm" :model="tuneForm" :rules="tuneRules" label-width="120px">
        <el-form-item label="练习类型" prop="tuneType">
          <el-select
            v-model="tuneForm.tuneType"
            filterable
            size="small"
            default-first-option
            @change="getMusicPracticeTuneTreeselect"
          >
            <el-option
              v-for="dict in tuneTypeOptions"
              :key="dict.id"
              :label="dict.text"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="tuneLable" prop="tune">
          <el-select
            v-model="tuneForm.tune"
            filterable
            allow-create
            size="small"
            default-first-option
          >
            <el-option
              v-for="dict in tuneOptions"
              :key="dict.id"
              :label="dict.text"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="timesLable" prop="times" >
             <el-input-number v-model="tuneForm.times" placeholder="分钟" controls-position="right" :min="0" :controls="false" :precision="0" :style="{width: '195px'}" />
             {{timesUnit}}
        </el-form-item>
        <el-form-item label="水平" prop="level">
          <el-select
            v-model="tuneForm.level"
            filterable
            allow-create
            size="small"
            default-first-option
          >
            <el-option
              v-for="dict in levelOptions"
              :key="dict.id"
              :label="dict.text"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitTuneForm">确 定</el-button>
        <el-button @click="cancelTune">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 以模板新增对话框 -->
    <el-dialog title="以模板新增" :visible.sync="cbtOpen" width="550px" append-to-body>
      <el-form ref="cbtForm" :model="cbtForm" :rules="cbtRules" label-width="120px">
        <el-form-item label="选择乐器" prop="musicInstrumentId">
          <el-select
            v-model="cbtForm.musicInstrumentId"
            placeholder="乐器"
            clearable
            size="small"
            style="width: 200px"
          >
            <el-option
              v-for="dict in musicInstrumentOptions"
              :key="dict.id"
              :label="dict.text"
              :value="dict.id"
            />
          </el-select>
          不选则代表全部
        </el-form-item>
        <el-form-item label="模板日期" prop="templateDate">
          <el-date-picker type="date" v-model="cbtForm.templateDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                    :style="{width: '200px'}" placeholder="请选择时间" clearable >
          </el-date-picker>
          默认是昨天
        </el-form-item>
        <el-form-item label="练习开始时间" prop="beginTime" >
          <el-date-picker type="datetime" v-model="cbtForm.beginTime" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                    :style="{width: '200px'}" placeholder="请选择时间" clearable >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitCbtForm">确 定</el-button>
        <el-button @click="cancelCbt">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 人生档案详情页面 -->
      <el-dialog :title="ladTitle" width="650px" :visible.sync="ladOpen"  append-to-body>
        <life-archives-detail :lifeArchivesData="lifeArchivesData" @closeMe="closeLad"/>
      </el-dialog>

      <!-- 概要统计页面 -->
      <el-dialog :title="ftsTitle" width="500px" :visible.sync="ftsOpen">
        <fts-detail :keyValueListData="keyValueListData"/>
      </el-dialog>

  </div>
</template>

<script>
import {getMusicInstrumentTree} from "@/api/music/musicInstrument";
import {fetchList,getMusicPracticeFromThisStat,getMusicPractice,createMusicPractice,updateMusicPractice,deleteMusicPractice,createMusicPracticeByTemplate} from "@/api/music/musicPractice";
import {fetchList as fetchTuneList,getMusicPracticeTuneTree,getMusicPracticeTune,createMusicPracticeTune,updateMusicPracticeTune,deleteMusicPracticeTune} from "@/api/music/musicPraticeTune";
import {getHourDesc,minuteDiff} from "@/utils/datetime";
import {dispatchCommonStat} from "@/utils/planUtils";
import LifeArchivesDetail from '../../life/lifeArchives/detail'
import FtsDetail from '../../common/keyValueTable'

export default {
  name: "MusicPractice",
  components: {
    'life-archives-detail':LifeArchivesDetail,
    'fts-detail':FtsDetail
  },
  data() {
    return {
      //同步档案属性 start
      ladTitle:'',
      ladOpen:false,
      lifeArchivesData:{},
      //同步档案属性 end
      tuneLable:'曲子名称',
      timesLable:'练习遍数',
      timesUnit:'遍',
      //概要统计
      ftsTitle:'',
      ftsOpen:false,
      keyValueListData:[],
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      //乐器列表
      musicInstrumentOptions:[],
      // 总条数
      total: 0,
      // 列表数据
      musicPraticeList:[],
      //曲子列表
      tuneList:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      /**曲子对话框配置start*/
      //曲子弹出层标题
      tuneTitle:"",
      //曲子弹出层
      tuneOpen:false,
      tuneTypeOptions:[],
      tuneOptions:[],
      levelOptions:[],
      tuneForm:{},
      /**曲子对话框配置end*/
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        name: undefined
      },
      // 表单参数
      form: {},
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 表单校验
      rules: {
        musicInstrumentId: [
          { required: true, message: "乐器不能为空", trigger: "blur" }
        ],
        practiceStartTime: [
          { required: true, message: "开始时间不能为空", trigger: "blur" }
        ],
        practiceEndTime: [
          { required: true, message: "结束时间不能为空", trigger: "blur" }
        ],
        minutes: [
          { required: true, message: "练习时长不能为空", trigger: "blur" }
        ]
      },
      // 表单校验
      tuneRules: {
        musicPracticeId: [
          { required: true, message: "先保存练习记录", trigger: "blur" }
        ],
        tuneType: [
          { required: true, message: "练习类型不能为空", trigger: "blur" }
        ],
        tune: [
          { required: true, message: "曲子/技术名称不能为空", trigger: "blur" }
        ],
        times: [
          { required: true, message: "练习次数/分钟不能为空", trigger: "blur" }
        ]
      },
      //以模板新增相关
      cbtOpen:false,
      cbtForm:{},
      cbtRules: {
        templateDate: [
          { required: true, message: "模板的日期不能为空", trigger: "blur" }
        ],
        beginTime: [
          { required: true, message: "练习开始时间不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getMusicInstrumentTreeselect();
    //曲子类型
    this.getEnumTree('MusicPracticeTuneType','FIELD',false).then(response => {
      this.tuneTypeOptions = response;
    });
    //曲子水平
    this.getEnumTree('MusicPracticeTuneLevel','FIELD',false).then(response => {
      this.levelOptions = response;
    });
  },
  methods: {
    /** 练习区间 */
    formatPracticeRange(row){
      let s = row.practiceStartTime.substr(11,5)+'~~'+row.practiceEndTime.substr(11,5);
      return s;
    },
    /** 计划统计 */
    planStat(){
      dispatchCommonStat('MusicPractice',this.$router);
    },
    /** 查询乐器下拉树结构 */
    getMusicInstrumentTreeselect() {
      getMusicInstrumentTree(false).then(response => {
        this.musicInstrumentOptions = response;
      });
    },
    /** 乐器变化 */
    handleMusicInstrumentChange(){
      this.$forceUpdate();
    },
    /** 查询曲子下拉树结构 */
    getMusicPracticeTuneTreeselect() {
      let tuneType = this.tuneForm.tuneType;
      if(tuneType=='TUNE'){
        this.tuneLable='曲子名称';
        this.timesLable='练习遍数';
        this.timesUnit='遍';
      }else{
        this.tuneLable='技术名称';
        this.timesLable='练习时长';
        this.timesUnit='分钟';
      }
      getMusicPracticeTuneTree(tuneType).then(response => {
        this.tuneOptions = response;
      });
    },
    /** 距离此刻的概要统计 */
    handleFromThisStat(row){
      this.ftsTitle='截止'+row.practiceDate+',['+row.musicInstrument.name+']练习统计信息';
      this.ftsOpen=true;
      getMusicPracticeFromThisStat(row.id).then(response => {
        var brData  = new Array();
        brData.push({key:'总次数',value :response.totalCount+'次' });
        brData.push({key:'总时长',value :(response.totalMinutes/60).toFixed(0)+'小时' });
        this.keyValueListData =brData;
      });
    },
    /** 同步档案 */
    handleLifeArchives(){
      const id = this.ids.join(",")
      getMusicPractice(id).then(response => {
        this.ladTitle='同步档案';
        this.ladOpen=true;
        this.lifeArchivesData={
          id:undefined,
          title:'音乐练习信息',
          content:response.musicInstrument.name,
          date:response.practiceStartTime,
          bussType:'MUSIC_PRACTICE',
          relatedBeans:'MusicPractice',
          sourceId:response.id,
          remark:undefined
        };
      });
    },
    /** 关闭同步档案 */
    closeLad(){
      this.ladOpen=false;
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.musicPraticeList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    /** 查询曲子列表 */
    getTuneList(musicPracticeId) {
      this.tuneList=[];
      if(musicPracticeId==null||musicPracticeId==undefined){
        return;
      }
      var para ={
        musicPracticeId:musicPracticeId,
        page:0
      };
      fetchTuneList(para).then(
        response => {
          this.tuneList = response.rows;
        }
      );
    },
    /** 时长的字段颜色 */
    getMinutesColor(minutes) {
      //days需要先被计算出来这里才能使用
      if(minutes<=50){
        return 'red';
      }else{
        return 'black';
      }
    },
    //计算时长
    calculateMinutes(){
      let practiceStartTime=this.form.practiceStartTime;
      let practiceEndTime =this.form.practiceEndTime;
      let minutes = minuteDiff(practiceStartTime,practiceEndTime);
      this.form.minutes=minutes;
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
        minutes: undefined
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
      //加载曲子列表
      this.getTuneList(undefined);
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids.join(",")
      getMusicPractice(id).then(response => {
        this.form = response;
        this.form.musicInstrumentId = response.musicInstrument.id+'';
        this.open = true;
        this.title = "修改";
        //加载曲子列表
        this.getTuneList(id);
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateMusicPractice(this.form).then(response => {
              this.msgSuccess("修改成功");
              //this.open = false;
              this.getList();
            });
          } else {
            createMusicPractice(this.form).then(response => {
              this.msgSuccess("新增成功");
              //this.open = false;
              this.form = response;
              this.form.musicInstrumentId = response.musicInstrument.id+'';
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
          return deleteMusicPractice(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    // 取消按钮
    cancelTune() {
      this.tuneOpen = false;
      this.resetTune();
    },
    // 表单重置
    resetTune() {
      this.tuneForm = {
        id: undefined,
        tuneType:'TUNE',
        tune: undefined,
        times: 0,
        level:undefined
      };
      this.resetForm("tuneForm");
    },
    /** 新增按钮操作 */
    handleCreateTune() {
      var musicPracticeId = this.form.id;
      if(this.isObjectEmpty(musicPracticeId)){
        this.msgError('请先保存练习记录');
        return;
      }
      this.resetTune();
      this.getMusicPracticeTuneTreeselect();
      //赋值外键
      this.tuneForm.musicPracticeId=musicPracticeId;
      this.tuneOpen = true;
      this.tuneTitle = "添加";
    },
    /** 修改按钮操作 */
    handleUpdateTune(row) {
      this.resetTune();
      const id = row.id;
      getMusicPracticeTune(id).then(response => {
        this.tuneForm = response;
        this.tuneForm.musicPracticeId=response.musicPractice.id;
        this.getMusicPracticeTuneTreeselect();
        this.tuneOpen = true;
        this.tuneTitle = "修改";
      });
    },
    /** 删除按钮操作 */
    handleDeleteTune(row) {
      const ids = row.id;
      this.$confirm('是否确认删除编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return deleteMusicPracticeTune(ids);
        }).then(() => {
          this.getTuneList(row.musicPractice.id);
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 提交按钮 */
    submitTuneForm: function() {
      this.$refs["tuneForm"].validate(valid => {
        if (valid) {
          if (this.tuneForm.id != undefined) {
            updateMusicPracticeTune(this.tuneForm).then(response => {
              this.msgSuccess("修改成功");
              this.tuneOpen = false;
              this.getTuneList(this.tuneForm.musicPracticeId);
            });
          } else {
            createMusicPracticeTune(this.tuneForm).then(response => {
              this.msgSuccess("新增成功");
              this.tuneOpen = false;
              this.getTuneList(this.tuneForm.musicPracticeId);
            });
          }
        }
      });
    },
    /** 以模板新增按钮操作 */
    handleCreateByTemplate(){
      this.cbtOpen=true;
    },
    /** 提交按钮 */
    submitCbtForm: function() {
      this.$refs["cbtForm"].validate(valid => {
        if (valid) {
          createMusicPracticeByTemplate(this.cbtForm).then(response => {
            this.msgSuccess("新增成功");
            this.cbtOpen = false;
            this.getList();
          });
        }
      });
    },
    cancelCbt(){
      this.cbtOpen = false;
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有购买来源数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportMusicPractice(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>
