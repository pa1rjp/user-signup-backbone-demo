console.log('Backbone app started !!!');

var app = {};

// User model to hold user information
app.UserModel = Backbone.Model.extend({
    defaults: {
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        password: ''
    }
});

// user collection to hold list of user models
app.UserCollection = Backbone.Collection.extend({
    model: app.UserModel, // ref to user model
    localStorage: new Backbone.LocalStorage('usersrepo') // init localstorage to save user model
});

app.usercol = new app.UserCollection();

// base view that fills default user inforamtion and init our app
app.UserView = Backbone.View.extend({
    el: "#wrapper",
    initialize: function() {
    	app.usercol.fetch(); // fetch all users and fill user collection

    	// if user collection is empty after fetch, then create sample users
        if (app.usercol.length == 0) {
            app.usercol.create({
                first_name: 'pavan',
                last_name: 'singh',
                email: 'pavan@gmail.com',
                username: 'pavan',
                password: '123456'
            });
            app.usercol.create({
                first_name: 'siva',
                last_name: 'raheja',
                email: 'siva@gmail.com',
                username: 'siva',
                password: '123456'
            });

            app.usercol.create({
                first_name: 'madhu',
                last_name: 'shliini',
                email: 'madhu@gmail.com',
                username: 'madhu',
                password: '123456'
            });

        };

        this.render();
    },
    render: function() {

    	// dynamically selecting tempates based on routes
        if (this.requrl() == 'userlist') {

            $('#header').html('user list');
            app.newTemplate = new app.UserList();

        } else if (this.requrl() == 'profile') {

            $('#header').html('profile');
            app.newTemplate = new app.UserProfile();

        } else {

            $('#header').html('signup');
            app.newTemplate = new app.Signup();

        };

        this.$el.empty();
        this.$el.append(app.newTemplate.render().el);

        return this;
    },
    // get url hash part ex; #signup, #profile
    requrl: function() {
        var url = Backbone.history.getFragment();
        if (url.indexOf('/') > 0) {
            return url.split('/')[0];
        } else {
            return url;
        };
    },
    // get requested profile from url ex: #profile/pavan, #profile/madhu
    reqprofile: function() {
        var url = Backbone.history.getFragment();
        if (url.indexOf('/') > 0) {
            return url.split('/')[1];
        } else {
            return '';
        };
    }
});

// sign up view
app.Signup = Backbone.View.extend({
    template: _.template($('#signup').html()),
    initialize: function() {

    },
    events: {
        'submit form': 'onSubmit'
    },
    render: function() {
        this.$el.html(this.template());
        return this;
    },
    onSubmit: function(e) {
        var self = this;
        e.preventDefault();
        // hide validation alert element
        $('#valmsg').addClass('hide');

        // create form object
        var attrs = {
            'first_name': $('#fname').val(),
            'last_name': $('#lname').val(),
            'email': $('#email').val(),
            'username': $('#uname').val(),
            'password': $('#password').val()
        };
        var isvalid = true;
        // basic validation to check if any of the inputs are empty
        _.each(attrs, function(val) {	
        	if(val == "") {
        		isvalid = false;
        	};
        })

        // if all inputs are present then save user and redirect to userlist view
        if (isvalid) {
        	app.usercol.create(attrs);	
        	window.location.href = "#userlist";
        } else { 
        	// if any of the inputs are empty then then show validation error message
        	$('#valmsg').removeClass('hide');
        	$('#valmsg').html('Please fill empty fields');
        };
    }
});

//user profile view
app.UserProfile = Backbone.View.extend({
    template: _.template($('#viewprofile').html()),
    render: function() {
        var user = 'null', that = this;
        // check if user collection is not empty
        if (app.usercol.length > 0) {

        	var uname = that.reqprofile(); // get requested profile from url
        	// get user information which matches requested username
            var _user = app.usercol.where({
                username: uname
            });
            // if requested user exists, then convert user OBJ to JOSN
            if (_user.length > 0) {
            	user = _user[0].toJSON();
            };
        };

        this.$el.html(this.template({
            user: user
        }));
        return this;
    },
    reqprofile: function() {
        var url = Backbone.history.getFragment();
        if (url.indexOf('/') > 0) {
            return url.split('/')[1];
        } else {
            return '';
        };
    }
});

// user list view
app.UserList = Backbone.View.extend({
    template: _.template($('#userslist').html()),
    render: function() {
        var users = []; // array to hold users
        // get all users from collection and push them to user array
        app.usercol.each(function(user) {
            users.push(user.toJSON());
        }, true);
        // pass queried users array to view
        this.$el.html(this.template({
            users: users
        }));
        return this;
    }
});

app.AppRouter = Backbone.Router.extend({
    routes: {
        "*actions": "doAction" // default route this takes care of all routes
    }
});

app.app_router = new app.AppRouter();

app.app_router.on('route:doAction', function(actions) {
	// init base view and pass user collection
    app.userview = new app.UserView({
        collection: app.usercol
    });
});

Backbone.history.start();