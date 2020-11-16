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
      <el-form-item label="名称" prop="tuneName">
        <el-input
          v-model="queryParams.tuneName"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
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
      <el-form-item label="练习类型" prop="tuneType">
        <el-select
          v-model="queryParams.tuneType"
          placeholder="练习类型"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in tuneTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['music:musicPracticeTune:query']">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="musicPracticeTuneList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="乐器" min-width="120px">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.musicPractice.musicInstrument.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="曲子名称" align="center">
        <template slot-scope="{row}">
          <span>{{ row.tune }}</span>
        </template>
      </el-table-column>
      <el-table-column label="练习时间" align="center" width="95">
        <template slot-scope="{row}">
          <span v-if="row.tuneType=='TUNE'">
           {{ row.times }}次
          </span>
          <span v-else>{{ row.times }}分钟</span>
        </template>
      </el-table-column>
      <el-table-column label="水平" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ row.levelName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ row.tuneTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="练习日期" align="center" width="100">
        <template slot-scope="{row}">
          <span>{{ row.musicPractice.practiceDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-s-data"
            @click="handleNameStatQuery(scope.row)"
            v-hasPermi="['music:musicPracticeTune:nameStat']"
          >曲子统计</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-s-data"
            @click="handleLevelStatQuery(scope.row)"
            v-hasPermi="['music:musicPracticeTune:levelStat']"
          >水平统计</el-button>
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

    <!-- 曲子统计对话框 -->
    <el-dialog title="曲子统计" :visible.sync="nameStatOpen" width="450px" append-to-body>
      <el-form :model="nameStatParams" ref="nameStatForm" :inline="true">
        <el-form-item label="数据来源" prop="allMi">
          <el-select
            v-model="nameStatParams.allMi"
            placeholder="数据来源"
            clearable
            size="small"
            style="width: 240px"
          >
            <el-option
              v-for="dict in allMiOptions"
              :key="dict.id"
              :label="dict.text"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="getNameStatList">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="nameStatList" v-loading="nameStatLoading">
        <el-table-column label="名称" prop="value" align="center">
          <template slot-scope="{row}">
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="值" prop="value" align="center">
          <template slot-scope="{row}">
            <span>{{ row.value }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 水平统计对话框 -->
    <el-dialog :title="levelTitle" :visible.sync="levelStatOpen" width="450px" append-to-body>
      <el-form :model="levelStatParams" ref="levelStatForm" :inline="true">
        <el-form-item label="数据来源" prop="allMi">
          <el-select
            v-model="levelStatParams.allMi"
            placeholder="数据来源"
            clearable
            size="small"
            style="width: 240px"
          >
            <el-option
              v-for="dict in allMiOptions"
              :key="dict.id"
              :label="dict.text"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="getLevelStatList">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="levelStatList" v-loading="levelStatLoading">
        <el-table-column label="水平" prop="value" align="center">
          <template slot-scope="{row}">
            <span v-if="row.icon != null">
             <i class="el-icon-bottom" />
            </span>
            <span>{{ row.levelName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="等级" prop="value" align="center">
          <template slot-scope="{row}">
            <span>{{ row.level }}</span>
          </template>
        </el-table-column>
        <el-table-column label="时间" prop="value" align="center">
          <template slot-scope="{row}">
            <span>{{ row.date }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import {getMusicInstrumentTree} from "@/api/music/musicInstrument";
import {fetchList,getMusicPracticeTuneNameStat,getMusicPracticeTuneLevelStat} from "@/api/music/musicPraticeTune";
import {dateDiff,formatDays} from "@/utils/datetime";

export default {
  name: "MusicPracticeTune",
  data() {
    return {
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
      musicPracticeTuneList:[],
      //乐器列表
      musicInstrumentOptions:[],
      //练习类型
      tuneTypeOptions:[],
      //数据来源
      allMiOptions:[
        {
          id: 'false',
          text: '当前乐器'
        },
        {
          id: 'true',
          text: '所有乐器'
        }
      ],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        name: undefined
      },
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      //曲子统计查询参数
      nameStatParams: {
        id:undefined,
        allMi:"false"
      },
      nameStatOpen:false,
      //曲子统计列表数据
      nameStatList:[],
      nameStatLoading:false,
      //水平统计查询参数
      levelStatParams: {
        id:undefined,
        allMi:"false"
      },
      levelStatOpen:false,
      //水平统计列表数据
      levelStatList:[],
      levelTitle:'',
      levelStatLoading:false
    };
  },
  created() {
    this.getList();
    this.getMusicInstrumentTreeselect();
    //曲子类型
    this.getEnumTree('MusicPracticeTuneType','FIELD',false).then(response => {
      this.tuneTypeOptions = response;
    });
  },
  methods: {
    /** 查询乐器下拉树结构 */
    getMusicInstrumentTreeselect() {
      getMusicInstrumentTree(false).then(response => {
        this.musicInstrumentOptions = response;
      });
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.musicPracticeTuneList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
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
    /** 曲子统计按钮操作 */
    handleNameStatQuery(row) {
      this.nameStatOpen = true;
      this.nameStatParams.id= row.id;
      this.getNameStatList();
    },
    /** 曲子统计查询列表 */
    getNameStatList() {
      this.nameStatLoading=true;
      getMusicPracticeTuneNameStat(this.nameStatParams).then(
        response => {
          let dataList = new Array();
          dataList.push({name:'曲子名称',value:response.tune});
          dataList.push({name:'首次练习时间',value:response.minPracticeDate});
          dataList.push({name:'最后练习时间',value:response.maxPracticeDate});
          let days = dateDiff(response.minPracticeDate,response.maxPracticeDate);
          days=formatDays(days);
          dataList.push({name:'练习间隔',value:days});
          dataList.push({name:'练习天数',value:response.totalTimes+'天'});
          dataList.push({name:'总练习次数',value:response.totalTimes+'次'});

          this.nameStatList = dataList;
          this.nameStatLoading=false;
        }
      );
    },
    /** 水平统计按钮操作 */
    handleLevelStatQuery(row) {
      this.levelStatOpen = true;
      this.levelTitle = '('+row.tune+')水平统计'
      this.levelStatParams.id= row.id;
      this.getLevelStatList();
    },
    /** 水平统计查询列表 */
    getLevelStatList() {
      this.levelStatLoading=true;
      getMusicPracticeTuneLevelStat(this.levelStatParams).then(
        response => {
          this.levelStatList = [];
          if(response==null||response.length==0){
          	this.msgAlert("未找到相关数据");
          	return;
          }
          let dataList = new Array();
          const n = response.length;
          let lastDate=response[0].minPracticeDate;
          for(let i=0;i<n;i++){
            let dd = response[i];
            if(i>0&&n>1){
              let days = dateDiff(lastDate,dd.minPracticeDate);
              let timeRow = {
                icon:'<i class="el-icon-bottom" />',
                level:'',
                date:formatDays(days)
              };
              dataList.push(timeRow);
            }
            let row = {
              levelName:dd.levelName,
              level:'L'+dd.levelIndex,
              date:dd.minPracticeDate
            };
            dataList.push(row);
            lastDate=dd.minPracticeDate;
          }
          this.levelStatList = dataList;
          this.levelStatLoading=false;
          
        }
      );
    }
  }
};
</script>
