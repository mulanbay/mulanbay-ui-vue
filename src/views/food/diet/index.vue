<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="名称检索" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="饮食日期">
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
      <el-form-item v-if="moreCdn==true" label="食物类型" prop="foodType">
        <el-select
          v-model="queryParams.foodType"
          placeholder="食物类型"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in foodTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.dietType"
          placeholder="餐次"
          clearable
          size="small"
          style="width: 115px"
        >
          <el-option
            v-for="dict in dietTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="食物来源" prop="dietSource">
        <el-select
          v-model="queryParams.dietSource"
          placeholder="食物来源"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in dietSourceOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="评分范围">
          <el-input-number v-model="queryParams.minScore" clearable :min="0" label="%" style="width: 120px"></el-input-number>
          <el-input-number v-model="queryParams.maxScore" clearable :min="0" label="%" style="width: 120px"></el-input-number>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['food:diet:query']">搜索</el-button>
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
          v-hasPermi="['food:diet:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          :disabled="single"
          @click="handleCreateAsTemplate"
          v-hasPermi="['food:diet:create']"
        >以此为模板</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['food:diet:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['food:diet:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['food:diet:export']"
        >导出</el-button>
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
    <el-table v-loading="loading" :data="dietList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" fixed="left" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="食物" fixed="left" min-width="280px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span v-if="row.score<3">
            <span class="link-type" style="color: red;" @click="handleUpdate(row)">{{ row.foods }}</span>
          </span>
          <span v-else>
            <span class="link-type" @click="handleUpdate(row)">{{ row.foods }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="标签" min-width="150px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.tags }}</span>
        </template>
      </el-table-column>
      <el-table-column label="食物类型" align="center" >
        <template slot-scope="{row}">
          <span>{{ row.foodTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="餐次" align="center">
        <template slot-scope="{row}">
          <span>{{ row.dietTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="来源" align="center">
        <template slot-scope="{row}">
          <span>{{ row.dietSourceName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="店铺/品牌" min-width="120px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.shop }}</span>
        </template>
      </el-table-column>
      <el-table-column label="评分" align="center">
        <template slot-scope="{row}">
          <span>{{ row.score }}</span>
        </template>
      </el-table-column>
      <el-table-column label="价格" align="center">
        <template slot-scope="{row}">
          <span>{{ formatMoneyWithSymbal(row.price) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="地点" align="center">
        <template slot-scope="{row}">
          <span>{{ row.location }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发生时间" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.occurTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center"  width="180">
        <template slot-scope="{row}">
          <span>{{ row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['food:diet:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['food:diet:delete']"
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
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="饮食餐次" prop="dietType">
              <el-select
                v-model="form.dietType"
                placeholder="餐次"
                clearable
                collapse-tags
                size="small"
                style="width: 240px"
              >
                <el-option
                  v-for="dict in dietTypeOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="食物来源" prop="dietSource">
              <el-select
                v-model="form.dietSource"
                placeholder="来源"
                clearable
                collapse-tags
                size="small"
                style="width: 240px"
              >
                <el-option
                  v-for="dict in dietSourceOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="食物明细" prop="foods">
              <el-tag
                :key="tag"
                v-for="tag in foodsTags"
                closable
                :disable-transitions="false"
                @close="handleFoodsTagClose(tag)">
                {{tag}}
              </el-tag>
              <el-input
                class="input-new-tag"
                v-if="inputFoodsVisible"
                v-model="inputFoodsValue"
                ref="saveFoodsTagInput"
                size="small"
                @keyup.enter.native="handleFoodsTagInputConfirm"
                @blur="handleFoodsTagInputConfirm"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showFoodsTagInput">+ 新建</el-button>
              <el-popover
                  placement="bottom"
                  title="请选择"
                  width="500"
                  trigger="click">
                  <el-tag
                    effect="plain"
                    :key="tag"
                    v-for="tag in foodsHisTags"
                    :disable-transitions="false"
                    @click="handleFoodsTagAppend(tag)">
                    {{tag}}
                  </el-tag>
                  <el-button slot="reference" type="success" size="mini" round >选择</el-button>
              </el-popover>
              <span class="link-type" @click="msgAlert('提示','食物的原料，比如：猪肉、胡萝卜')"><i class="el-icon-question" /></span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="食物类型" prop="foodType">
              <el-select
                v-model="form.foodType"
                placeholder="食物类型"
                clearable
                collapse-tags
                size="small"
                style="width: 240px"
              >
                <el-option
                  v-for="dict in foodTypeOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发生时间" prop="occurTime">
              <el-date-picker type="datetime" v-model="form.occurTime" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                        :style="{width: '240px'}" placeholder="请选择时间" clearable >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="食物标签" prop="tags">
              <el-tag
                :key="tag"
                v-for="tag in tagsTags"
                closable
                :disable-transitions="false"
                @close="handleTagsTagClose(tag)">
                {{tag}}
              </el-tag>
              <el-input
                class="input-new-tag"
                v-if="inputTagsVisible"
                v-model="inputTagsValue"
                ref="saveTagsTagInput"
                size="small"
                @keyup.enter.native="handleTagsTagInputConfirm"
                @blur="handleTagsTagInputConfirm"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showTagsTagInput">+ 新建</el-button>
              <el-popover
                  placement="bottom"
                  title="请选择"
                  width="500"
                  trigger="click">
                  <el-tag
                    effect="plain"
                    :key="tag"
                    v-for="tag in tagsHisTags"
                    :disable-transitions="false"
                    @click="handleTagsTagAppend(tag)">
                    {{tag}}
                  </el-tag>
                  <el-button slot="reference" type="success" size="mini" round >选择</el-button>
              </el-popover>
              <span class="link-type" @click="msgAlert('提示','菜名')"><i class="el-icon-question" /></span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="店铺/品牌" prop="tags">
              <el-tag
                :key="tag"
                v-for="tag in shopTags"
                closable
                :disable-transitions="false"
                @close="handleShopTagClose(tag)">
                {{tag}}
              </el-tag>
              <el-input
                class="input-new-tag"
                v-if="inputShopVisible"
                v-model="inputShopValue"
                ref="saveShopTagInput"
                size="small"
                @keyup.enter.native="handleShopTagInputConfirm"
                @blur="handleShopTagInputConfirm"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showShopTagInput">+ 新建</el-button>
              <el-popover
                  placement="bottom"
                  title="请选择"
                  width="500"
                  trigger="click">
                  <el-tag
                    effect="plain"
                    :key="tag"
                    v-for="tag in shopHisTags"
                    :disable-transitions="false"
                    @click="handleShopTagAppend(tag)">
                    {{tag}}
                  </el-tag>
                  <el-button slot="reference" type="success" size="mini" round >选择</el-button>
              </el-popover>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="价格/成本" prop="price">
              <el-input-number v-model="form.price" style="width: 240px" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2"/>
              元
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="食物评分" prop="score">
              <el-rate
                v-model="form.score"
                show-score
                text-color="#ff9900"
                score-template="{value}">
              </el-rate>
            </el-form-item>
          </el-col>
          <el-col :span="4">
              <span class="link-type" @click="showScoreDesc"><i class="el-icon-question" /></span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="地点" prop="location">
              <el-input v-model="form.location" style="width: 600px" placeholder="" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" style="width: 600px" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script>
  import {fetchList,getDiet,createDiet,updateDiet,deleteDiet,
  getFoodsTree,getShopTree,getTagsTree,getDietLastLocation} from "@/api/food/diet";
  import {appendTagToOptions} from "@/utils/tagUtils";
  import {dispatchCommonStat} from "@/utils/planUtils";
  import {getNowDateTimeString} from "@/utils/datetime";

export default {
  name: "Diet",
  data() {
    return {
      //查询条件更多属性 start
      cdnTitle:'更多',
      moreCdn:false,
      //查询条件更多属性 end
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
      dietList:[],
      foodTypeOptions:[],
      dietTypeOptions:[],
      dietSourceOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      //标签属性 start
      //选择列表
      //食物的标签列表
      foodsHisTags: [],
      foodsTags: [],
      inputFoodsVisible: false,
      inputFoodsValue: '',
      //食物的标签列表
      tagsHisTags: [],
      tagsTags: [],
      inputTagsVisible: false,
      inputTagsValue: '',
      //店铺的标签列表
      shopHisTags: [],
      shopTags: [],
      inputShopVisible: false,
      inputShopValue: '',
      //标签属性 end
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
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        dietType: [
          { required: true, message: "餐次不能为空", trigger: "blur" }
        ],
        dietSource: [
          { required: true, message: "来源不能为空", trigger: "blur" }
        ],
        foods: [
          { required: true, message: "食物不能为空", trigger: "blur" }
        ],
        foodType: [
          { required: true, message: "食物类型不能为空", trigger: "blur" }
        ],
        occurTime: [
          { required: true, message: "发生时间不能为空", trigger: "blur" }
        ],
        price: [
          { required: true, message: "价格不能为空", trigger: "blur" }
        ],
        score: [
          { required: true, message: "评分不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getEnumTree('FoodType','FIELD',false).then(response => {
      this.foodTypeOptions = response;
    });
    this.getEnumTree('DietType','FIELD',false).then(response => {
      this.dietTypeOptions = response;
    });
    this.getEnumTree('DietSource','FIELD',false).then(response => {
      this.dietSourceOptions = response;
    });
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
    /** 计划统计 */
    planStat(){
      dispatchCommonStat('Diet',this.$router);
    },
    /** 评分说明 */
    showScoreDesc(){
      let msg="评分范围0-5，代表食物的质量，方便后期的饮食跟踪分析，比如哪些食物会引起个人的不适<br>";
      msg+="*5为最高等级，说明该食物对自己非常的有用<br>";
      msg+="*4为表示该食物比较不错，有些惊喜<br>";
      msg+="*3为默认值，表示该食物一般般<br>";
      msg+="*2表示该食物稍微引起自己不适<br>";
      msg+="*1表示该食物严重引起个人不适<br>";
      msg+="*0表示该食物不能食用<br>";
      this.msgAlert('提示',msg);
    },
    /** 标签处理 start */
    //加载历史的食物标签
    loadHisTags(){
      //加载foods的标签
      getFoodsTree(false).then(response => {
        this.foodsHisTags = [];
        for (let i = 0; i < response.length; i++) {
          this.foodsHisTags.push(response[i].id);
        }
      });
      getShopTree(false).then(response => {
        this.shopHisTags = [];
        for (let i = 0; i < response.length; i++) {
          this.shopHisTags.push(response[i].id);
        }
      });
      getTagsTree(false).then(response => {
        this.tagsHisTags = [];
        for (let i = 0; i < response.length; i++) {
          this.tagsHisTags.push(response[i].id);
        }
      });
    },
    //食物的标签处理start
    handleFoodsTagClose(tag){
      this.foodsTags.splice(this.foodsTags.indexOf(tag), 1);
    },
    handleFoodsTagAppend(tag) {
      appendTagToOptions(tag,this.foodsTags);
    },
    showFoodsTagInput() {
      this.inputFoodsVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveFoodsTagInput.$refs.input.focus();
      });
    },
    handleFoodsTagInputConfirm() {
      let inputFoodsValue = this.inputFoodsValue;
      if (inputFoodsValue) {
        appendTagToOptions(inputFoodsValue,this.foodsTags);
      }
      this.inputFoodsVisible = false;
      this.inputFoodsValue = '';
    },
    //食物的标签处理end
    //tags的标签处理start
    handleTagsTagClose(tag){
      this.tagsTags.splice(this.tagsTags.indexOf(tag), 1);
    },
    handleTagsTagAppend(tag) {
      appendTagToOptions(tag,this.tagsTags);
    },
    showTagsTagInput() {
      this.inputTagsVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagsTagInput.$refs.input.focus();
      });
    },
    handleTagsTagInputConfirm() {
      let inputTagsValue = this.inputTagsValue;
      if (inputTagsValue) {
        appendTagToOptions(inputTagsValue,this.tagsTags);
      }
      this.inputTagsVisible = false;
      this.inputTagsValue = '';
    },
    //tags的标签处理end

    //店铺的标签处理start
    handleShopTagClose(tag){
      this.shopTags.splice(this.shopTags.indexOf(tag), 1);
    },
    handleShopTagAppend(tag) {
      appendTagToOptions(tag,this.shopTags);
    },
    showShopTagInput() {
      this.inputShopVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveShopTagInput.$refs.input.focus();
      });
    },
    handleShopTagInputConfirm() {
      let inputShopValue = this.inputShopValue;
      if (inputShopValue) {
        appendTagToOptions(inputShopValue,this.shopTags);
      }
      this.inputShopVisible = false;
      this.inputShopValue = '';
    },
    //店铺的标签处理end
    /** 标签处理 end */
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.dietList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
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
        dietType: 'BREAKFAST',
        dietSource: 'SELF_MADE',
        price:0,
        score:3,
        location:undefined
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
      this.foodsTags = [];
      this.tagsTags = [];
      this.shopTags = [];
      this.loadHisTags();
      getDietLastLocation().then(response => {
        this.form.location=response;
      });
      this.open = true;
      this.title = "添加";
    },
    /** 以模板新增按钮操作 */
    handleCreateAsTemplate(){
      this.reset();
      this.loadHisTags();
      const id = this.ids.join(",")
      getDiet(id).then(response => {
        this.copyToForm(response);
        this.form.id=undefined;
        this.form.occurTime=getNowDateTimeString();
        this.open = true;
        this.title = "新增";
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.loadHisTags();
      const id = row.id || this.ids.join(",")
      getDiet(id).then(response => {
        this.copyToForm(response);
        this.open = true;
        this.title = "修改";
      });
    },
    /** 复制 */
    copyToForm(response){
      this.form = response;
      if(!this.isObjectEmpty(response.foods)){
        this.foodsTags = response.foods.split(',');
      }else{
        this.foodsTags = [];
      }
      if(!this.isObjectEmpty(response.tags)){
        this.tagsTags = response.tags.split(',');
      }else{
        this.tagsTags = [];
      }
      if(!this.isObjectEmpty(response.shop)){
        this.shopTags = response.shop.split(',');
      }else{
        this.shopTags = [];
      }
    },
    /** 提交按钮 */
    submitForm: function() {
      if(this.foodsTags.length>0){
        this.form.foods = this.foodsTags.join(',');
      }else{
        this.form.foods = undefined;
      }
      if(this.tagsTags.length>0){
        this.form.tags = this.tagsTags.join(',');
      }else{
        this.form.tags = undefined;
      }
      if(this.shopTags.length>0){
        this.form.shop = this.shopTags.join(',');
      }else{
        this.form.shop = undefined;
      }
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateDiet(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createDiet(this.form).then(response => {
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
          return deleteDiet(ids);
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
          return exportDiet(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>
