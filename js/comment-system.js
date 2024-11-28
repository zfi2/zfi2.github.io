class CommentSystem {
    constructor(containerId, apiUrl) {
      this.container = document.getElementById(containerId);
      this.apiUrl = apiUrl;
      this.currentPage = 1;
      this.commentsPerPage = 5;
      this.init();
    }
  
    async init() {
      this.container.innerHTML = `
        <div id="c_inputDiv">
          <form id="c_form">
            <h2 id="c_widgetTitle">leave something after yourself...</h2>
            
            <div id="c_nameWrapper" class="c-inputWrapper">
              <label class="c-label c-nameLabel" for="name-input">your name</label>
              <input class="c-input c-nameInput" id="name-input" type="text" maxlength="16" required>
            </div>
  
            <div id="c_websiteWrapper" class="c-inputWrapper">
              <label class="c-label c-websiteLabel" for="website-input">(disabled, ignore for now)</label>
              <input class="c-input c-websiteInput" id="website-input" type="url" pattern="https://.*" disabled>
            </div>
  
            <div id="c_textWrapper" class="c-inputWrapper">
              <label class="c-label c-textLabel" for="comment-input"></label>
              <textarea class="c-input c-textInput" id="comment-input" rows="4" maxlength="75" required style="resize: none;"></textarea>
            </div>
  
            <button id="c_submitButton" type="submit">submit</button>
            <span id="c_replyingText" style="display: none;"></span>
          </form>
        </div>
        <div id="c_container">loading comments...</div>
      `;
  
      this.bindEvents();
      await this.loadComments();
    }
  
    bindEvents() {
      const form = this.container.querySelector('#c_form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitComment();
      });
    }
  
    async submitComment() {
      const nameInput = this.container.querySelector('#name-input');
      const commentInput = this.container.querySelector('#comment-input');
      const replyingText = this.container.querySelector('#c_replyingText');
      const submitButton = this.container.querySelector('#c_submitButton');
  
      if (!nameInput.value || !commentInput.value) {
        alert('Please fill in all fields');
        return;
      }
  
      submitButton.disabled = true;
  
      try {
        const response = await fetch(`${this.apiUrl}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: nameInput.value,
            comment: commentInput.value,
            parentId: replyingText.dataset.replyTo || null
          })
        });
  
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error posting comment');
        }
  
        nameInput.value = '';
        commentInput.value = '';
        replyingText.style.display = 'none';
        replyingText.dataset.replyTo = '';
        await this.loadComments();
      } catch (error) {
        alert(error.message);
      } finally {
        submitButton.disabled = false;
      }
    }
  
    async loadComments() {
      try {
        const response = await fetch(`${this.apiUrl}/`);
        const comments = await response.json();
        this.renderComments(comments);
      } catch (error) {
        console.error('Error loading comments:', error);
        this.container.querySelector('#c_container').innerHTML = 'Error loading comments...';
      }
    }
  
    renderComments(comments) {
      const container = this.container.querySelector('#c_container');
      container.innerHTML = '';
  
      const mainComments = comments.filter(c => !c.parent_id);
      const replies = comments.filter(c => c.parent_id);
  
      if (mainComments.length === 0) {
        container.innerHTML = 'no comments to show';
        return;
      }
  
      const startIndex = (this.currentPage - 1) * this.commentsPerPage;
      const endIndex = startIndex + this.commentsPerPage;
      const pageComments = mainComments.slice(startIndex, endIndex);
  
      pageComments.forEach(comment => {
        const commentElement = this.createCommentElement(comment);
        const commentReplies = replies.filter(r => r.parent_id === comment.id);
        
        if (commentReplies.length > 0) {
          const repliesContainer = document.createElement('div');
          repliesContainer.className = 'c-replyContainer';
          repliesContainer.id = `${comment.id}-replies`;
          repliesContainer.style.display = 'none';
          
          commentReplies.forEach(reply => {
            repliesContainer.appendChild(this.createCommentElement(reply, true));
          });
          
          const expandButton = document.createElement('button');
          expandButton.className = 'c-expandButton';
          expandButton.innerHTML = `show replies (${commentReplies.length})`;
          expandButton.onclick = () => this.toggleReplies(comment.id);
          
          commentElement.appendChild(expandButton);
          commentElement.appendChild(repliesContainer);
        }
  
        container.appendChild(commentElement);
      });
  
      if (mainComments.length > this.commentsPerPage) {
        this.addPagination(container, mainComments.length);
      }
    }
  
    createCommentElement(comment, isReply = false) {
      const div = document.createElement('div');
      div.className = isReply ? 'c-reply' : 'c-comment';
      
      const timestamp = new Date(comment.timestamp).toLocaleDateString();
      
      div.innerHTML = `
        <h3 class="c-name">${this.escapeHtml(comment.name)}</h3>
        <span class="c-timestamp">${timestamp}</span>
        <p class="c-text">${this.escapeHtml(comment.comment)}</p>
        ${!isReply ? `<button class="c-replyButton" onclick="window.commentSystem.openReply('${comment.id}', '${this.escapeHtml(comment.name)}')">reply</button>` : ''}
      `;
      
      return div;
    }
  
    addPagination(container, totalComments) {
      const totalPages = Math.ceil(totalComments / this.commentsPerPage);
      const paginationDiv = document.createElement('div');
      paginationDiv.id = 'c_pagination';
  
      const leftButton = document.createElement('button');
      leftButton.className = 'c-paginationButton';
      leftButton.innerHTML = '<<';
      leftButton.disabled = this.currentPage === 1;
      leftButton.onclick = () => this.changePage('left');
  
      const rightButton = document.createElement('button');
      rightButton.className = 'c-paginationButton';
      rightButton.innerHTML = '>>';
      rightButton.disabled = this.currentPage === totalPages;
      rightButton.onclick = () => this.changePage('right');
  
      paginationDiv.appendChild(leftButton);
      paginationDiv.appendChild(rightButton);
      container.appendChild(paginationDiv);
    }
  
    changePage(direction) {
      if (direction === 'left' && this.currentPage > 1) {
        this.currentPage--;
      } else if (direction === 'right') {
        this.currentPage++;
      }
      this.loadComments();
    }
  
    openReply(commentId, commentAuthor) {
      const replyingText = this.container.querySelector('#c_replyingText');
      
      if (replyingText.style.display === 'none') {
        replyingText.innerHTML = `replying to ${commentAuthor}...`;
        replyingText.style.display = 'block';
        replyingText.dataset.replyTo = commentId;
      } else {
        replyingText.style.display = 'none';
        replyingText.dataset.replyTo = '';
      }
      
      document.querySelector('#c_inputDiv').scrollIntoView({ behavior: 'smooth' });
    }
  
    toggleReplies(commentId) {
      const repliesContainer = document.getElementById(`${commentId}-replies`);
      const expandButton = repliesContainer.previousElementSibling;
      
      if (repliesContainer.style.display === 'none') {
        repliesContainer.style.display = 'block';
        expandButton.innerHTML = `hide replies (${repliesContainer.children.length})`;
      } else {
        repliesContainer.style.display = 'none';
        expandButton.innerHTML = `show replies (${repliesContainer.children.length})`;
      }
    }
  
    escapeHtml(unsafe) {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  }
  
  // Initialize globally so we can access methods from onclick handlers
  window.commentSystem = null;

  document.addEventListener('DOMContentLoaded', () => {
    window.commentSystem = new CommentSystem('c_widget', 'https://api.lain.ovh/');
  });