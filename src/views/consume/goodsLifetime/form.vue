<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="类型名称" prop="name">
        <el-input v-model="form.name" :style="{width: '100%'}" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="关键字" prop="keywords">
        <el-tag
          :key="tag"
          v-for="tag in keywordsTags"
          closable
          :disable-transitions="false"
          @close="handleTagClose(tag)">
          {{tag}}
        </el-tag>
        <el-input
          class="input-new-tag"
          v-if="inputVisible"
          v-model="inputValue"
          ref="saveTagInput"
          size="small"
          @keyup.enter.native="handleTagInputConfirm"
          @blur="handleTagInputConfirm"
        >
        </el-input>
        <el-button v-else class="button-new-tag" size="small" @click="showTagInput">+ 新建</el-button>
        <el-popover
            placement="bottom"
            title="请选择"
            width="500"
            trigger="click">
            <el-tag
              effect="plain"
              :key="tag"
              v-for="tag in hisKeywordsTags"
              :disable-transitions="false"
              @click="handleTagAppend(tag)">
              {{tag}}
            </el-tag>
            <el-button slot="reference" type="success" size="mini" round>选择</el-button>
        </el-popover>
      </el-form-item>
      <el-form-item label="有效天数" prop="days">
        <el-input-number v-model="form.days" :style="{width: '60%'}" controls-position="right" :min="0" :controls="true" :precision="0"/>
        <el-select
          v-model="fc"
          placeholder="快速选择"
          size="medium"
          style="width: 105px"
          @change="selectDays"
        >
          <el-option
            v-for="dict in daysOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注信息">
        <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>

  </div>
</template>

<script>
import {getGoodsLifetime,createGoodsLifetime,updateGoodsLifetime} from "@/api/consume/goodsLifetime";
import {appendTagToOptions} from "@/utils/tagUtils";
import {formatDays} from "@/utils/datetime";

export default {
  name: "GoodsLifetimeForm",
  props: {
      //父层带过来的信息值
      goodsLifetimeData: {id:undefined}
  },
  data() {
    return {
      //标签属性 start
      keywordsTags: [],
      //已经保存过的商品标签
      hisKeywordsTags:[],
      inputVisible: false,
      inputValue: '',
      //标签属性 end
      //时长快速选择
      fc:30,
      daysOptions:[
        {id:30,text:'一个月'},
        {id:90,text:'三个月'},
        {id:180,text:'半年'},
        {id:365,text:'一年'},
        {id:730,text:'两年'},
        {id:1095,text:'三年'},
        {id:1825,text:'五年'},
        {id:3650,text:'十年'}
      ],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" }
        ],
        keywords: [
          { required: true, message: "关键字不能为空", trigger: "blur" }
        ],
        days: [
          { required: true, message: "有效天数不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.handleReceiveData(this.goodsLifetimeData);
  },
  //监听父层带过来的账户信息值
  watch:{
    goodsLifetimeData: {
      deep: true,
      handler(val) {
        this.goodsLifetimeData =val;
        this.handleReceiveData(this.goodsLifetimeData);
      }
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      if(data.id != null ){
        this.reset();
        this.getKeywordsTreeselect();
        const id = data.id;
        getGoodsLifetime(id).then(response => {
          this.form = response;
          this.keywordsTags = response.keywords.split(',');
        });
      }else{
        this.reset();
      }
    },
    /** 时长快速选择 */
    selectDays(){
      this.form.days = this.fc;
    },
    /** 标签处理 start */
    handleTagClose(tag){
      this.keywordsTags.splice(this.keywordsTags.indexOf(tag), 1);
    },
    handleTagAppend(tag) {
      appendTagToOptions(tag,this.keywordsTags);
    },
    showTagInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    handleTagInputConfirm() {
      let inputValue = this.inputValue;
      if (inputValue) {
        appendTagToOptions(inputValue,this.keywordsTags);
      }
      this.inputVisible = false;
      this.inputValue = '';
    },
    /** 标签处理 end */
    /** 查询历史的关键字下拉树结构 */
    getKeywordsTreeselect() {
      //后期从用户的客服记录中获取
      this.hisKeywordsTags=['默认'];
    },
    // 取消按钮
    cancel() {
      this.$emit('closeMe');
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        name: undefined,
        days: 30,
        keywords: undefined
      };
      this.keywordsTags = [];
      this.resetForm("form");
    },
    /** 提交按钮 */
    submitForm: function() {
      this.form.keywords = this.keywordsTags.join(',');
      this.$refs["form"].validate(valid => {
        if (valid!=null) {
          if (this.form.id != undefined) {
            updateGoodsLifetime(this.form).then(response => {
              this.msgSuccess("修改成功");
              //调用父组件的方法
              const mi={
                update: false
              }
              //调用父组件的方法
              this.$emit('confirmLifetimeForm',mi);
            });
          } else {
            createGoodsLifetime(this.form).then(response => {
              this.msgSuccess("新增成功");
              //调用父组件的方法
              const mi={
                update: true
              }
              //调用父组件的方法
              this.$emit('confirmLifetimeForm',mi);
            });
          }
        }
      });
    }
  }
};
</script>
